import 'dotenv/config';
import { kv } from "@vercel/kv";
import { generateEncryptionKey, encryptSecurely } from "@/lib/server-encryption";
import type { Subscription } from "@/types/check-in";

async function createTestSubscription() {
  console.log("🔐 Creating test subscription...");

  // Sample user responses
  const testData = {
    responses: {
      pastYear: {
        calendarReview: "Started a new project in March, faced challenges in June",
        biggestSurprise: "Unexpected promotion at work",
      },
      yearAhead: {
        secretWish: "Launch my own business by year end",
        sixSentences: {
          drawEnergyFrom: "Morning meditation and exercise",
          beBravest: "When pitching to new clients"
        }
      },
      closing: {
        letterToSelf: "Remember to take breaks and celebrate small wins"
      }
    },
    frameworks: ["tarot"]
  };

  try {
    // Generate encryption key
    console.log("🔑 Generating encryption key...");
    const key = generateEncryptionKey();
    
    // Save key for later use (in real app, use proper key management)
    process.env.SECURE_KEY = key.toString('base64');
    
    // Encrypt the data
    console.log("📝 Encrypting user responses...");
    const encryptedData = await encryptSecurely(testData, key);
    
    // Create subscription object
    const subscription: Subscription = {
      id: "test-sub-1",
      email: "test@example.com",
      frequency: "monthly",
      frameworks: ["tarot"],
      lastCheckIn: null,
      nextCheckIn: new Date("2024-02-01T09:00:00Z").toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      responses: encryptedData,
      analysisDepth: "comprehensive"
    };

    // Store in KV
    console.log("💾 Storing subscription in KV...");
    await Promise.all([
      kv.set(`subscription:${subscription.id}`, subscription),
      kv.sadd(`email:${subscription.email}`, subscription.id)
    ]);

    console.log("✅ Test subscription created successfully!");
    console.log("📊 Subscription details:", {
      id: subscription.id,
      email: subscription.email,
      frequency: subscription.frequency,
      nextCheckIn: subscription.nextCheckIn,
      frameworks: subscription.frameworks
    });

    return subscription.id;
  } catch (error) {
    console.error("❌ Failed to create test subscription:", error);
    throw error;
  }
}

async function verifySubscription(subscriptionId: string) {
  console.log(`🔍 Verifying subscription ${subscriptionId}...`);

  try {
    const subscription = await kv.get<Subscription>(`subscription:${subscriptionId}`);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    console.log("✅ Subscription verified!");
    console.log("📊 Stored data:", {
      id: subscription.id,
      email: subscription.email,
      frequency: subscription.frequency,
      nextCheckIn: subscription.nextCheckIn,
      frameworks: subscription.frameworks,
      encryptedDataSize: JSON.stringify(subscription.responses).length
    });

    return subscription;
  } catch (error) {
    console.error("❌ Failed to verify subscription:", error);
    throw error;
  }
}

// Only run if called directly
if (require.main === module) {
  (async () => {
    try {
      const subscriptionId = await createTestSubscription();
      await verifySubscription(subscriptionId);
    } catch (error) {
      console.error("Test failed:", error);
      process.exit(1);
    }
  })();
} 