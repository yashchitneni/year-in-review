import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { decryptSecurely, clearSensitiveData } from '@/lib/secure-encryption';
import type { SecureEncryption } from '@/lib/secure-encryption';
import type { Subscription } from '@/types/check-in';

// Configure for edge runtime
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Isolated region for secure processing
};

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a CryptoKey from the environment variable
async function getDecryptionKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = Buffer.from(keyData, 'base64');
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    true,
    ['decrypt']
  );
}

async function generateCheckInContent(
  decryptedResponses: any,
  frameworks: string[]
): Promise<string> {
  try {
    // Process in isolated memory
    const content = await Promise.all(
      frameworks.map(async (framework) => {
        // Generate framework-specific insights
        // We'll implement this later with the AI model
        return `Your ${framework} insights will go here`;
      })
    );

    return content.join('\n\n');
  } finally {
    // Clear sensitive data from memory
    clearSensitiveData(decryptedResponses);
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("🔒 Starting secure check-in processing...");

  try {
    const { subscriptionId } = await request.json();
    console.log(`📝 Processing subscription: ${subscriptionId}`);
    
    // Retrieve subscription
    const subscription: Subscription | null = await kv.get(
      `subscription:${subscriptionId}`
    );

    if (!subscription) {
      console.error(`❌ Subscription not found: ${subscriptionId}`);
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Found subscription for ${subscription.email}`);
    console.log(`📊 Framework(s): ${subscription.frameworks.join(", ")}`);

    // Get the decryption key from environment
    const keyData = process.env.SECURE_KEY;
    if (!keyData) {
      console.error("❌ Decryption key not available");
      throw new Error("Decryption key not available");
    }

    try {
      console.log("🔑 Importing decryption key...");
      // Import the key for decryption
      const decryptionKey = await getDecryptionKey(keyData);

      console.log("🔓 Decrypting responses...");
      // Decrypt responses in isolated memory
      const decryptedResponses = await decryptSecurely(
        subscription.responses,
        decryptionKey
      );

      console.log("🤖 Generating email content...");
      // Generate email content
      const emailContent = await generateCheckInContent(
        decryptedResponses,
        subscription.frameworks
      );

      console.log("📧 Sending email...");
      // Send email
      await resend.emails.send({
        from: 'YearCompass <checkins@yearcompass.com>',
        to: subscription.email,
        subject: `Your ${subscription.frameworks.join("/")} Check-in`,
        text: emailContent,
        headers: {
          'X-Entity-Ref-ID': subscriptionId
        }
      });

      console.log("📅 Updating next check-in date...");
      // Update next check-in date
      const nextCheckIn = new Date();
      nextCheckIn.setMonth(
        nextCheckIn.getMonth() + 
        (subscription.frequency === 'monthly' ? 1 : 3)
      );

      await kv.hset(`subscription:${subscriptionId}`, {
        lastCheckIn: new Date().toISOString(),
        nextCheckIn: nextCheckIn.toISOString()
      });

      const processingTime = Date.now() - startTime;
      console.log(`✨ Processing completed in ${processingTime}ms`);

      return NextResponse.json({ 
        success: true,
        processingTime,
        nextCheckIn: nextCheckIn.toISOString()
      });
    } finally {
      console.log("🧹 Clearing sensitive data...");
      // Ensure sensitive data is cleared
      clearSensitiveData(subscription);
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Secure processing error:', error);
    console.error(`⏱️ Failed after ${processingTime}ms`);
    
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
} 