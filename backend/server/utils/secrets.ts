import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

let _jwtSecret: string | null = null;

/**
 * Returns the JWT/session signing secret.
 * In production, requires SESSION_SECRET or JWT_SECRET to be set.
 * In development, falls back to a dev-only key.
 */
export function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

  if (secret) {
    _jwtSecret = secret;
    return _jwtSecret;
  }

  if (isProduction) {
    throw new Error('FATAL: SESSION_SECRET or JWT_SECRET must be set in production. Set this environment variable before starting the server.');
  }

  _jwtSecret = 'raksha-dev-only-jwt-secret-not-for-production';
  return _jwtSecret;
}
