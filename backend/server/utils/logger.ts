type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  duration?: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const minLogLevel = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLogLevel];
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m'
  };
  
  const reset = '\x1b[0m';
  const color = levelColors[entry.level];
  
  let log = `${time} ${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;
  
  if (entry.requestId) {
    log += ` [req:${entry.requestId.substring(0, 8)}]`;
  }
  
  if (entry.duration !== undefined) {
    log += ` (${entry.duration}ms)`;
  }
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    log += ` ${JSON.stringify(entry.context)}`;
  }
  
  return log;
}

function log(level: LogLevel, message: string, context?: Record<string, any>) {
  if (!shouldLog(level)) return;
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };
  
  const formatted = formatLog(entry);
  
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, any>) => log('debug', message, context),
  info: (message: string, context?: Record<string, any>) => log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
  error: (message: string, context?: Record<string, any>) => log('error', message, context),
  
  http: (method: string, path: string, statusCode: number, duration: number, userId?: string) => {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    log(level, `${method} ${path} ${statusCode}`, { duration, userId });
  },
  
  payment: (action: string, orderId: string, context?: Record<string, any>) => {
    log('info', `[Payment] ${action}`, { orderId, ...context });
  },
  
  security: (action: string, context?: Record<string, any>) => {
    log('warn', `[Security] ${action}`, context);
  },
  
  audit: (action: string, userId: string, context?: Record<string, any>) => {
    log('info', `[Audit] ${action}`, { userId, ...context });
  }
};
