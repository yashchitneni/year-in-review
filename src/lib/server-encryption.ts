import crypto from 'crypto';
import type { SecureEncryption } from './secure-encryption';

// Generate a secure encryption key for testing
export function generateEncryptionKey(): Buffer {
  return crypto.randomBytes(32); // 256 bits
}

// Encrypt data with authentication
export async function encryptSecurely(
  data: any,
  key: Buffer
): Promise<SecureEncryption> {
  // Generate a random IV
  const iv = crypto.randomBytes(12);
  
  // Create cipher
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    key,
    iv
  );
  
  // Convert data to string
  const jsonString = JSON.stringify(data);
  
  // Encrypt the data
  const encryptedData = Buffer.concat([
    cipher.update(jsonString, 'utf8'),
    cipher.final()
  ]);
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  return {
    data: encryptedData.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    keyVersion: "v1",
    encryptedAt: new Date().toISOString()
  };
}

// Decrypt data with authentication
export async function decryptSecurely(
  encryption: SecureEncryption,
  key: Buffer
): Promise<any> {
  try {
    const iv = Buffer.from(encryption.iv, 'base64');
    const encryptedData = Buffer.from(encryption.data, 'base64');
    const authTag = Buffer.from(encryption.authTag, 'base64');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      iv
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error("Decryption failed - data may be tampered with");
    throw new Error("Secure decryption failed");
  }
}

// Memory safety function
export function clearSensitiveData(data: any): void {
  if (Buffer.isBuffer(data)) {
    data.fill(0);
  } else if (typeof data === 'string') {
    data = '0'.repeat(data.length);
  } else if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      clearSensitiveData(data[key]);
      delete data[key];
    });
  }
} 