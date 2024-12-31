import { Subscription } from "@/types/check-in";
import { SecureEncryption } from "../secure-encryption";
import { decryptSecurely } from "../server-encryption";
import { generateGeminiResponse } from "../gemini";

export interface ContentGenerationContext {
  subscription: Subscription;
  decryptedResponses: any;
  framework: string;
  previousInsights?: any;
}

export interface GeneratedContent {
  insights: string[];
  followUpQuestions: string[];
  generatedAt: string;
  framework: string;
}

export async function processSubscriptionForContent(
  subscription: Subscription,
  encryptionKey: Buffer
): Promise<GeneratedContent | null> {
  try {
    // 1. Decrypt the responses
    const decryptedResponses = await decryptSecurely(
      subscription.responses as SecureEncryption,
      encryptionKey
    );

    // 2. Create context for content generation
    const context: ContentGenerationContext = {
      subscription,
      decryptedResponses,
      framework: subscription.frameworks[0], // For now, just use the first framework
    };

    // 3. Generate content based on the framework
    const content = await generateFrameworkContent(context);

    return {
      ...content,
      generatedAt: new Date().toISOString(),
      framework: context.framework
    };
  } catch (error) {
    console.error("Failed to process subscription for content:", error);
    return null;
  }
}

async function generateFrameworkContent(
  context: ContentGenerationContext
): Promise<Omit<GeneratedContent, 'generatedAt' | 'framework'>> {
  // This will be expanded to handle different frameworks
  const { framework, decryptedResponses } = context;
  
  // For now, we'll focus on generating insights
  const insightPrompt = `Based on the following responses, generate 3 meaningful insights:
    ${JSON.stringify(decryptedResponses.responses, null, 2)}
  `;

  const followUpPrompt = `Based on these responses, generate 2 thoughtful follow-up questions:
    ${JSON.stringify(decryptedResponses.responses, null, 2)}
  `;

  const [insightsResponse, followUpResponse] = await Promise.all([
    generateGeminiResponse(insightPrompt),
    generateGeminiResponse(followUpPrompt)
  ]);

  return {
    insights: insightsResponse.split('\n').filter(Boolean),
    followUpQuestions: followUpResponse.split('\n').filter(Boolean)
  };
}

// Helper function to determine if a subscription needs new content
export function isContentGenerationDue(subscription: Subscription): boolean {
  if (!subscription.lastCheckIn) return true;
  
  const lastCheckIn = new Date(subscription.lastCheckIn);
  const nextCheckIn = new Date(subscription.nextCheckIn);
  const now = new Date();
  
  return now >= nextCheckIn && (
    !subscription.lastContentGeneration ||
    new Date(subscription.lastContentGeneration) < lastCheckIn
  );
} 