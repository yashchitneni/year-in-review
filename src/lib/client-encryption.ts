// We use the Web Crypto API for client-side encryption
// This is more secure as the key never leaves the user's browser

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

export async function encryptData(data: any, key: CryptoKey): Promise<{
  encryptedData: string;
  iv: string;
}> {
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert data to string
  const jsonString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);
  
  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedData
  );
  
  return {
    encryptedData: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv)
  };
}

export async function decryptData(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<any> {
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBuffer(iv)
      },
      key,
      base64ToBuffer(encryptedData)
    );
    
    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Failed to decrypt data");
    throw error;
  }
}

// Helper functions to convert between ArrayBuffer and Base64
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