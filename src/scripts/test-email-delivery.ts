import 'dotenv/config';
import { sendTestEmail, sendCheckInEmail } from '@/lib/email/delivery';
import { processSubscriptionForContent } from '@/lib/content-generation/pipeline';
import { generateEncryptionKey } from '@/lib/server-encryption';
import type { Subscription } from '@/types/check-in';

async function testEmailDelivery(email: string) {
  try {
    // 1. First, test basic email delivery
    console.log("🧪 Testing basic email delivery...");
    const testResult = await sendTestEmail(email);
    
    if (!testResult.success) {
      throw new Error(`Test email failed: ${testResult.error}`);
    }
    
    console.log("✅ Test email sent successfully!");
    console.log("📧 Message ID:", testResult.messageId);

    // 2. Now test content email delivery
    console.log("\n🧪 Testing content email delivery...");
    
    // Create a test subscription with direct test data
    const subscription: Subscription = {
      id: "test-email-1",
      email: email,
      frequency: "monthly",
      frameworks: ["tarot"],
      lastCheckIn: null,
      nextCheckIn: new Date("2024-02-01T09:00:00Z").toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
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
      }
    };

    // Generate content
    console.log("🎯 Generating content...");
    const content = {
      insights: [
        "You've shown remarkable adaptability, transitioning from facing challenges to achieving unexpected success.",
        "Your morning routine of meditation and exercise forms a strong foundation for personal growth.",
        "There's a clear entrepreneurial spirit driving your future aspirations."
      ],
      followUpQuestions: [
        "How might your morning routine evolve to support your business launch goals?",
        "What specific steps can you take to maintain work-life balance while pursuing your entrepreneurial dreams?"
      ],
      generatedAt: new Date().toISOString(),
      framework: "tarot"
    };

    // Send content email
    console.log("📧 Sending content email...");
    const contentResult = await sendCheckInEmail(subscription, content);
    
    if (!contentResult.success) {
      throw new Error(`Content email failed: ${contentResult.error}`);
    }
    
    console.log("✅ Content email sent successfully!");
    console.log("📧 Message ID:", contentResult.messageId);

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  // Check for email argument
  const emailArg = process.argv[2];
  if (emailArg) {
    // Update test email if provided
    console.log(`Using provided email: ${emailArg}`);
    testEmailDelivery(emailArg);
  } else {
    console.log("Please provide a test email address:");
    console.log("npx tsx src/scripts/test-email-delivery.ts your.email@example.com");
    process.exit(1);
  }
} 