import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

let _encryptionKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (_encryptionKey) return _encryptionKey;
  const key = process.env.PII_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Crypto] FATAL: PII_ENCRYPTION_KEY not set in production! Cannot start without encryption key.');
    }
    console.warn('[Crypto] WARNING: PII_ENCRYPTION_KEY not set — using default key for development only.');
    _encryptionKey = crypto.scryptSync('raksha-default-encryption-key-2026', 'raksha-salt', 32);
    return _encryptionKey;
  }
  _encryptionKey = crypto.scryptSync(key, 'raksha-pii-salt', 32);
  return _encryptionKey;
}

export function encryptPII(plaintext: string): string {
  if (!plaintext) return plaintext;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptPII(encrypted: string): string {
  if (!encrypted || !encrypted.includes(':')) return encrypted;
  
  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    return encrypted;
  }
}

export function hashForSearch(plaintext: string): string {
  if (!plaintext) return plaintext;
  return crypto
    .createHash('sha256')
    .update(plaintext.toLowerCase().trim())
    .digest('hex')
    .substring(0, 16);
}

export function maskAadhar(aadhar: string): string {
  if (!aadhar || aadhar.length < 4) return '****';
  return 'XXXX-XXXX-' + aadhar.slice(-4);
}

export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return '****';
  return mobile.slice(0, 2) + '****' + mobile.slice(-2);
}

export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32;
}
