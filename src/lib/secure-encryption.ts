"use client";

import { Buffer } from 'buffer';

export interface SecureEncryption {
  data: string;       // Base64 encoded encrypted data
  iv: string;         // Base64 encoded initialization vector
  authTag: string;    // Base64 encoded authentication tag
  keyVersion: string; // Version of the key used for encryption
  encryptedAt: string;// Timestamp of encryption
}

// Generate a secure encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

// Encrypt data with authentication
export async function encryptSecurely(
  data: any,
  key: CryptoKey
): Promise<SecureEncryption> {
  // Generate a random IV for each encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert data to string and then to buffer
  const jsonString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);
  
  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128 // 128-bit auth tag
    },
    key,
    encodedData
  );
  
  // Split the result into encrypted data and auth tag
  const encryptedContent = encryptedBuffer.slice(0, encryptedBuffer.byteLength - 16);
  const authTag = encryptedBuffer.slice(encryptedBuffer.byteLength - 16);
  
  return {
    data: bufferToBase64(encryptedContent),
    iv: bufferToBase64(iv.buffer),
    authTag: bufferToBase64(authTag),
    keyVersion: "v1", // We'll implement key rotation later
    encryptedAt: new Date().toISOString()
  };
}

// Decrypt data with authentication
export async function decryptSecurely(
  encryption: SecureEncryption,
  key: CryptoKey
): Promise<any> {
  try {
    // Reconstruct the complete encrypted data with auth tag
    const encryptedContent = base64ToBuffer(encryption.data);
    const authTag = base64ToBuffer(encryption.authTag);
    const iv = base64ToBuffer(encryption.iv);
    
    // Combine encrypted content and auth tag
    const completeBuffer = new Uint8Array(encryptedContent.length + authTag.length);
    completeBuffer.set(new Uint8Array(encryptedContent), 0);
    completeBuffer.set(new Uint8Array(authTag), encryptedContent.length);
    
    // Decrypt with authentication
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128
      },
      key,
      completeBuffer
    );
    
    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed - data may be tampered with");
    throw new Error("Secure decryption failed");
  }
}

// Helper functions
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Memory safety function
export function clearSensitiveData(data: any): void {
  if (typeof data === 'string') {
    data = '0'.repeat(data.length);
  } else if (data instanceof Uint8Array) {
    data.fill(0);
  } else if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      clearSensitiveData(data[key]);
      delete data[key];
    });
  }
} 