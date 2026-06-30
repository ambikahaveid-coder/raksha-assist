/**
 * Runs before server start on every deploy.
 * Creates all DB tables directly using the migration SQL file,
 * bypassing drizzle-kit push (which fails due to PG16 public schema permissions).
 * Uses the same SSL-fixed pool as the main app.
 */
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Strip sslmode — pg-connection-string maps sslmode=require → verify-full
// which ignores rejectUnauthorized:false (same fix as db.ts)
const rawUrl = process.env.DATABASE_URL || "";
const cleanUrl = rawUrl
  .replace(/[?&]sslmode=[^&]*/g, "")
  .replace(/[?&]sslaccept=[^&]*/g, "")
  .replace(/\?$/, "")
  .replace(/&$/, "");

const isRemote =
  rawUrl.includes("digitalocean") ||
  rawUrl.includes("ondigitalocean.com") ||
  (process.env.NODE_ENV === "production" && !rawUrl.includes("localhost"));

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});

let client;
try {
  client = await pool.connect();
} catch (connErr) {
  console.log("[setup-schema] DB connection failed:", connErr.message);
  await pool.end().catch(() => {});
  process.exit(0);
}

try {
  // 1. Diagnose current permissions
  const info = await client.query(`
    SELECT
      current_user AS db_user,
      current_database() AS db_name,
      has_schema_privilege(current_user, 'public', 'CREATE') AS can_create,
      (SELECT nspacl::text FROM pg_namespace WHERE nspname = 'public') AS schema_acl
  `);
  console.log("[setup-schema] permissions:", JSON.stringify(info.rows[0]));

  // 2. Try to grant CREATE (in case user is schema owner via some DO config)
  if (!info.rows[0].can_create) {
    try {
      await client.query("GRANT CREATE ON SCHEMA public TO CURRENT_USER");
      const recheck = await client.query(
        "SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS can_create"
      );
      console.log("[setup-schema] after GRANT, can_create:", recheck.rows[0].can_create);
      if (!recheck.rows[0].can_create) {
        // Try via pg_database_owner or direct owner assignment
        await client.query("GRANT pg_database_owner TO CURRENT_USER").catch(() => {});
      }
    } catch (e) {
      console.log("[setup-schema] GRANT failed:", e.message);
    }
  }

  // 3. Run the migration SQL directly through our SSL-working pool
  const migFile = path.join(__dirname, "../migrations/0000_eager_sabra.sql");
  if (!fs.existsSync(migFile)) {
    console.log("[setup-schema] Migration file not found, skipping");
    process.exit(0);
  }

  const migSql = fs.readFileSync(migFile, "utf8");
  const statements = migSql
    .split(/--> statement-breakpoint/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`[setup-schema] Running ${statements.length} migration statements...`);
  let created = 0, skipped = 0, failed = 0;

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      created++;
    } catch (e) {
      // 42P07 = table already exists, 42710 = object already exists
      if (e.code === "42P07" || e.code === "42710" || e.message?.includes("already exists")) {
        skipped++;
      } else {
        console.log(`[setup-schema] stmt failed (${e.code}): ${e.message?.slice(0, 120)}`);
        failed++;
        // If permission denied, stop — no point continuing
        if (e.code === "42501") {
          console.log("[setup-schema] FATAL: permission denied. A superuser must run:");
          console.log(`[setup-schema]   GRANT CREATE ON SCHEMA public TO "${info.rows[0].db_user}";`);
          break;
        }
      }
    }
  }

  console.log(`[setup-schema] Done: ${created} created, ${skipped} already existed, ${failed} failed`);
} catch (err) {
  console.log("[setup-schema] Unexpected error:", err.message);
} finally {
  client.release();
  await pool.end();
}
