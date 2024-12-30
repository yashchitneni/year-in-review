import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const subscriptionSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(['monthly', 'quarterly']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, frequency } = subscriptionSchema.parse(body);

    // Create a unique key for the subscription
    const subscriptionKey = `subscription:${email}`;
    
    // Store subscription data
    await kv.hset(subscriptionKey, {
      email,
      frequency,
      createdAt: new Date().toISOString(),
      status: 'active',
      lastCheckIn: null,
    });

    // Add to frequency-based sets for batch processing
    const frequencySetKey = `subscriptions:${frequency}`;
    await kv.sadd(frequencySetKey, email);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to check-ins',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 