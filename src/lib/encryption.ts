import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// The encryption key should be 32 bytes (256 bits) for aes-256-gcm
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): { encryptedData: string; iv: string; tag: string } {
  // Generate a random initialization vector
  const iv = randomBytes(12);
  
  // Create cipher
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the auth tag
  const tag = cipher.getAuthTag();
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decrypt(encryptedData: string, iv: string, tag: string): string {
  // Create decipher
  const decipher = createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  // Set auth tag
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  // Decrypt the text
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 