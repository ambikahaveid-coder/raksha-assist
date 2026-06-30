import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let isRecreating = false;

const isProduction = process.env.NODE_ENV === 'production';

function createPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  const dbUrl = process.env.DATABASE_URL || '';
  const requiresSsl = dbUrl.includes('supabase.co') || dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require') || dbUrl.includes('digitalocean') || dbUrl.includes('ondigitalocean.com') || (isProduction && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));

  // Strip sslmode/sslaccept from the connection string to avoid conflicts
  // with the ssl pool option — when both are present, pg can fail with
  // SELF_SIGNED_CERT_IN_CHAIN even though rejectUnauthorized is false.
  const cleanDbUrl = requiresSsl
    ? dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]sslaccept=[^&]*/g, '').replace(/\?$/, '').replace(/&$/, '')
    : dbUrl;

  const newPool = new Pool({
    connectionString: cleanDbUrl,
    max: isProduction ? 20 : 10,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
    statement_timeout: 15000,
    query_timeout: 15000,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  });

  // Ensure search_path is set correctly on every new connection
  newPool.on('connect', (client) => {
    client.query("SET search_path TO public");
  });

  newPool.on('error', (err) => {
    console.error('[DB] Pool background error:', err.message);
    if (
      err.message.includes('administrator command') ||
      err.message.includes('Connection terminated') ||
      err.message.includes('ECONNRESET')
    ) {
      console.log('[DB] Fatal pool error detected - scheduling pool recreation');
      schedulePoolRecreation();
    }
  });

  return newPool;
}

async function schedulePoolRecreation() {
  if (isRecreating) return;
  isRecreating = true;
  
  try {
    const oldPool = pool;
    pool = null;
    dbInstance = null;
    
    if (oldPool) {
      try {
        await oldPool.end().catch(() => {});
      } catch (e) {}
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    pool = createPool();
    dbInstance = drizzle(pool, { schema });
    console.log('[DB] Pool successfully recreated after fatal error');
  } catch (e: any) {
    console.error('[DB] Pool recreation failed:', e.message);
  } finally {
    isRecreating = false;
  }
}

function getPool(): pg.Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export async function checkDatabaseHealth(): Promise<{ 
  healthy: boolean; 
  latency: number; 
  poolSize: number; 
  availableConnections: number;
  waitingClients: number;
  error?: string 
}> {
  const start = Date.now();
  try {
    const p = getPool();
    const client = await p.connect();
    await client.query('SELECT 1');
    client.release();
    return {
      healthy: true,
      latency: Date.now() - start,
      poolSize: p.totalCount,
      availableConnections: p.idleCount,
      waitingClients: p.waitingCount
    };
  } catch (error: any) {
    return {
      healthy: false,
      latency: Date.now() - start,
      poolSize: pool?.totalCount || 0,
      availableConnections: pool?.idleCount || 0,
      waitingClients: pool?.waitingCount || 0,
      error: error.message
    };
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isRetryable = 
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === '57P01' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('timeout');
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`[DB] Retry ${attempt}/${maxRetries} after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

export function getPoolStats() {
  const p = pool;
  if (!p) return null;
  return {
    total: p.totalCount,
    idle: p.idleCount,
    waiting: p.waitingCount,
    maxConnections: isProduction ? 50 : 20
  };
}

export async function gracefulShutdown(): Promise<void> {
  if (pool) {
    console.log('[DB] Closing database pool...');
    await pool.end();
    console.log('[DB] Database pool closed');
  }
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!dbInstance) {
      dbInstance = drizzle(getPool(), { schema });
    }
    return (dbInstance as any)[prop];
  }
});

export async function withTransaction<T>(fn: (tx: typeof db) => Promise<T>): Promise<T> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance.transaction(async (tx) => {
    return fn(tx as any);
  });
}
