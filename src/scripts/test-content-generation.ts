import 'dotenv/config';
import { kv } from "@vercel/kv";
import { processSubscriptionForContent } from "@/lib/content-generation/pipeline";
import { generateEncryptionKey, encryptSecurely } from "@/lib/server-encryption";
import type { Subscription } from "@/types/check-in";
import type { SecureEncryption } from "@/lib/secure-encryption";

async function createTestSubscription(encryptionKey: Buffer): Promise<string> {
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
    // Encrypt the data
    console.log("📝 Encrypting user responses...");
    const encryptedData = await encryptSecurely(testData, encryptionKey);
    
    // Create subscription object
    const subscription: Subscription = {
      id: "test-sub-2", // Using a different ID to avoid conflicts
      email: "test@example.com",
      frequency: "monthly",
      frameworks: [],
      lastCheckIn: null,
      nextCheckIn: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      responses: {
        data: "",
        iv: "",
        authTag: "",
        keyVersion: "",
        encryptedAt: new Date().toISOString()
      },
      analysisDepth: "comprehensive"
    };

    // Store in KV
    console.log("💾 Storing subscription in KV...");
    await Promise.all([
      kv.set(`subscription:${subscription.id}`, subscription),
      kv.sadd(`email:${subscription.email}`, subscription.id)
    ]);

    console.log("✅ Test subscription created successfully!");
    return subscription.id;
  } catch (error) {
    console.error("❌ Failed to create test subscription:", error);
    throw error;
  }
}

async function testContentGeneration() {
  try {
    // 1. Generate encryption key
    console.log("🔑 Generating encryption key...");
    const encryptionKey = generateEncryptionKey();
    
    // 2. Create test subscription
    const subscriptionId = await createTestSubscription(encryptionKey);
    
    // 3. Get the subscription
    console.log("🔍 Fetching test subscription...");
    const subscription = await kv.get<Subscription>(`subscription:${subscriptionId}`);
    
    if (!subscription) {
      throw new Error("Test subscription not found");
    }
    
    // 4. Generate content
    console.log("🎯 Generating content...");
    const content = await processSubscriptionForContent(subscription, encryptionKey);
    
    if (!content) {
      throw new Error("Failed to generate content");
    }

    // 5. Display results
    console.log("\n✨ Generated Content:");
    console.log("\n🔮 Insights:");
    content.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });

    console.log("\n❓ Follow-up Questions:");
    content.followUpQuestions.forEach((question, i) => {
      console.log(`${i + 1}. ${question}`);
    });

    console.log("\n📊 Generation Details:");
    console.log(`Framework: ${content.framework}`);
    console.log(`Generated At: ${content.generatedAt}`);

    // 6. Clean up
    console.log("\n🧹 Cleaning up test data...");
    await Promise.all([
      kv.del(`subscription:${subscriptionId}`),
      kv.srem(`email:${subscription.email}`, subscriptionId)
    ]);
    console.log("✅ Test data cleaned up successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testContentGeneration();
} 