import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Subscription, SubscriptionRequest } from "@/types/check-in";
import type { AnalysisFramework } from "@/lib/gemini";

// Validation schema for encrypted responses
const encryptedDataSchema = z.object({
  data: z.string(),
  iv: z.string(),
  authTag: z.string(),
  keyVersion: z.string(),
  encryptedAt: z.string()
});

const publicInsightsSchema = z.object({
  frameworks: z.array(z.enum([
    "pattern",
    "growth",
    "tarot",
    "mantra",
    "hero",
    "quest",
    "constellation",
    "custom"
  ])) as z.ZodType<AnalysisFramework[]>,
  keyInsights: z.record(z.array(z.string()))
});

// Validation schema
const subscriptionSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(["monthly", "quarterly"]),
  frameworks: z.array(z.enum([
    "pattern",
    "growth",
    "tarot",
    "mantra",
    "hero",
    "quest",
    "constellation",
    "custom"
  ])) as z.ZodType<AnalysisFramework[]>,
  responses: encryptedDataSchema
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = subscriptionSchema.parse(body);
    
    // Generate unique ID for subscription
    const subscriptionId = nanoid();
    
    // Create subscription object with encrypted responses
    const subscription: Subscription = {
      id: subscriptionId,
      email: validatedData.email,
      frequency: validatedData.frequency,
      frameworks: validatedData.frameworks,
      lastCheckIn: null,
      nextCheckIn: calculateNextCheckIn(validatedData.frequency),
      createdAt: new Date().toISOString(),
      status: "active",
      responses: validatedData.responses
    };

    // Store in KV database
    // We store two entries:
    // 1. The full subscription data
    // 2. An email index to look up subscriptions by email
    await Promise.all([
      kv.set(`subscription:${subscriptionId}`, subscription),
      kv.sadd(`email:${validatedData.email}`, subscriptionId)
    ]);

    // Log successful subscription (without responses)
    console.log('New subscription created:', {
      id: subscriptionId,
      email: validatedData.email,
      frequency: validatedData.frequency,
      frameworks: validatedData.frameworks
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to check-ins",
      subscription: {
        id: subscriptionId,
        email: validatedData.email,
        frequency: validatedData.frequency,
        frameworks: validatedData.frameworks
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid subscription data",
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create subscription" 
      },
      { status: 500 }
    );
  }
}

function calculateNextCheckIn(frequency: "monthly" | "quarterly"): string {
  const now = new Date();
  const next = new Date(now);

  if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setMonth(next.getMonth() + 3);
  }

  // Set to beginning of the day
  next.setHours(0, 0, 0, 0);
  
  return next.toISOString();
} 