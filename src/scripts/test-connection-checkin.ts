import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

import { kv } from "@vercel/kv";
import { generateEncryptionKey, encryptSecurely } from "@/lib/server-encryption";
import { sendCheckInEmail } from "@/lib/email/delivery";
import type { Subscription, AnalysisDepth } from "@/types/check-in";

async function createTestSubscription(email: string, analysisDepth: AnalysisDepth): Promise<string> {
  console.log("🔐 Creating test subscription with connection data...");

  // Sample user responses with rich relationship data
  const testData = {
    responses: {
      pastYear: {
        calendarReview: "Had weekly coffee chats with Sarah, started monthly game nights with the team, reconnected with old friend Mike in June",
        yearOverview: {
          friendsCommunity: "Strengthened bonds with work team through virtual events, deepened friendship with Sarah through regular check-ins",
          personalFamily: "Weekly family dinners with parents, helped sister Amy move to new city"
        },
        peopleWhoInfluenced: "Sarah helped me grow professionally with her mentorship. Mike inspired me to start running again. Amy showed incredible resilience during her move.",
        peopleYouInfluenced: "Mentored junior dev Tom, helped Maria improve her presentation skills",
        whoHelped: "The entire team supported the project launch, especially Alex and Rachel",
        whoHelpedChallenges: "Sarah and Mike were there during the tough times, offering perspective and support"
      },
      yearAhead: {
        yearOverview: {
          friendsCommunity: "Plan to organize monthly community events, continue mentoring relationships",
          personalFamily: "Want to start family game nights, plan regular video calls with Amy"
        },
        magicalTriplets: {
          connectWithLovedOnes: [
            "Monthly virtual game nights with friends",
            "Weekly check-ins with Sarah",
            "Quarterly family reunions"
          ],
          pillarsInRoughTimes: [
            "Sarah - my mentor and friend",
            "Mike - running buddy and confidant",
            "Amy - sister and cheerleader"
          ]
        }
      }
    },
    frameworks: ["connections"]
  };

  try {
    // Generate encryption key
    console.log("🔑 Generating encryption key...");
    const key = generateEncryptionKey();
    
    // Save key for later use
    process.env.SECURE_KEY = key.toString('base64');
    
    // Encrypt the data
    console.log("📝 Encrypting user responses...");
    const encryptedData = await encryptSecurely(testData, key);
    
    // Create subscription object
    const subscription: Subscription = {
      id: `test-conn-${Date.now()}`,
      email,
      frequency: "daily", // For testing purposes
      frameworks: ["connections"],
      lastCheckIn: null,
      nextCheckIn: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // 5 minutes from now
      createdAt: new Date().toISOString(),
      status: "active",
      responses: encryptedData,
      analysisDepth // Add the analysis depth
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
      frameworks: subscription.frameworks,
      analysisDepth
    });

    return subscription.id;
  } catch (error) {
    console.error("❌ Failed to create test subscription:", error);
    throw error;
  }
}

async function testConnectionCheckIn(email: string) {
  try {
    // Test each analysis depth with different content styles
    for (const depth of ["comprehensive", "focused", "maintenance"] as AnalysisDepth[]) {
      console.log(`\n🧪 Testing ${depth} connection analysis...`);
      
      const subscriptionId = await createTestSubscription(email, depth);
      const subscription = await kv.get<Subscription>(`subscription:${subscriptionId}`);
      
      if (!subscription) {
        throw new Error("Test subscription not found");
      }

      // Generate content based on analysis depth
      let content;
      switch (depth) {
        case "comprehensive":
          content = {
            insights: [
              "Your relationship ecosystem shows a healthy balance of professional mentorship (Sarah), personal growth (Mike), and family bonds (Amy)",
              "You've successfully maintained regular touchpoints through varied activities: coffee chats, running sessions, and family video calls",
              "Your connections demonstrate mutual growth, with you both receiving and providing support across different life domains"
            ],
            followUpQuestions: [
              "How has your weekly rhythm with Sarah evolved to accommodate both professional and personal conversations?",
              "What aspects of Mike's perspective have most influenced your approach to challenges?",
              "How has your relationship with Amy adapted since her move to maintain closeness despite distance?"
            ],
            framework: "connections",
            generatedAt: new Date().toISOString(),
            analysis: `Sarah:
Role: Professional mentor and close friend who has become a cornerstone of your growth
Moments of Impact: Provided crucial mentorship during career transitions and emotional support through challenges, demonstrating the evolution from mentor to trusted friend
Outreach Plan: Schedule next weekly coffee chat, prepare 2-3 specific wins to discuss, and explore how your mentor relationship has evolved.

Mike:
Role: Running buddy and trusted confidant who inspires healthy lifestyle changes
Moments of Impact: Catalyzed your return to running, offered unique perspectives during difficult decisions, and maintained consistent support
Outreach Plan: Plan next running session, share your recent lifestyle improvements, and discuss how mutual accountability has strengthened your friendship.

Amy:
Role: Sister and emotional anchor providing family stability
Moments of Impact: Showed remarkable resilience during her move, maintained family connections through regular communication, and inspired new ways of staying connected
Outreach Plan: Set up next video call, compile recent family photos to share, and plan the next family reunion details.`
          };
          break;

        case "focused":
          content = {
            insights: [
              "Your key relationships center around three core pillars: mentorship, wellness, and family",
              "Each connection offers unique value through different interaction styles"
            ],
            followUpQuestions: [
              "Which recent interaction with Sarah has been most impactful?",
              "What's your next milestone with Mike in your fitness journey?"
            ],
            framework: "connections",
            generatedAt: new Date().toISOString(),
            analysis: `Sarah:
Role: Professional mentor and friend
Moments of Impact: Recent mentorship sessions have led to tangible professional growth
Outreach Plan: Schedule coffee chat focusing on your latest career milestone.

Mike:
Role: Running buddy and wellness accountability partner
Moments of Impact: Consistent running sessions have built a strong foundation for honest conversations
Outreach Plan: Set up next run and pick a new route to explore together.

Amy:
Role: Sister and family connector
Moments of Impact: Regular video calls have kept family bonds strong despite distance
Outreach Plan: Share family updates and plan next virtual gathering.`
          };
          break;

        case "maintenance":
          content = {
            insights: [
              "Quick check-in needed with your core support network",
              "Simple actions can maintain connection momentum"
            ],
            followUpQuestions: [
              "When was your last catch-up with each person?",
            ],
            framework: "connections",
            generatedAt: new Date().toISOString(),
            analysis: `Sarah:
Role: Mentor & friend
Moments of Impact: Weekly check-ins provide consistent support
Outreach Plan: Send a quick message to confirm next coffee chat.

Mike:
Role: Running buddy
Moments of Impact: Regular exercise sessions keep you both accountable
Outreach Plan: Check availability for next run.

Amy:
Role: Sister
Moments of Impact: Family updates keep everyone connected
Outreach Plan: Share a recent photo or quick family update.`
          };
          break;
      }

      console.log("📧 Generating and sending check-in email...");
      const emailResult = await sendCheckInEmail(subscription, content);
      
      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      console.log(`✅ ${depth} check-in email sent successfully!`);
      console.log("📧 Message ID:", emailResult.messageId);

      // Clean up
      console.log("🧹 Cleaning up test data...");
      await Promise.all([
        kv.del(`subscription:${subscriptionId}`),
        kv.srem(`email:${subscription.email}`, subscriptionId)
      ]);
    }

    console.log("\n✨ All analysis depths tested successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.log("Please provide a test email address:");
    console.log("npx tsx src/scripts/test-connection-checkin.ts your.email@example.com");
    process.exit(1);
  }
  
  testConnectionCheckIn(emailArg);
} 