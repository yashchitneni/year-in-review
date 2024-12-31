import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Subscription } from '@/types/check-in';

export const config = {
  runtime: 'edge'
};

// Helper to check if a check-in is due
function isCheckInDue(nextCheckIn: string | null): boolean {
  if (!nextCheckIn) return false;
  const nextDate = new Date(nextCheckIn);
  const now = new Date();
  return nextDate <= now;
}

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by Vercel
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all subscriptions
    let cursor = 0;
    const subscriptions: Subscription[] = [];
    
    // Process subscriptions in batches
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { 
        match: 'subscription:*', 
        count: 50 
      });
      
      const batch = await Promise.all(
        keys.map(key => kv.get<Subscription>(key))
      );
      
      subscriptions.push(...batch.filter((sub): sub is Subscription => 
        sub !== null && 
        sub.status === 'active' && 
        isCheckInDue(sub.nextCheckIn)
      ));
      
      cursor = typeof nextCursor === 'number' ? nextCursor : 0;
    } while (cursor !== 0);

    // Process each due subscription in the secure worker
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const response = await fetch(
            new URL('/api/secure-worker/process-checkins', request.url).toString(),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId: subscription.id
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to process subscription ${subscription.id}`);
          }

          return subscription.id;
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          throw error;
        }
      })
    );

    // Count successes and failures
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: {
        total: subscriptions.length,
        succeeded,
        failed
      }
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Scheduler failed' },
      { status: 500 }
    );
  }
} 