import { kv } from '@vercel/kv';

// Rate limit configuration
const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 15,
  REQUESTS_PER_DAY: 1500,
};

interface RateLimitResult {
  success: boolean;
  minuteLimit?: number;
  minuteRemaining?: number;
  dayLimit?: number;
  dayRemaining?: number;
  resetIn?: number;
}

export async function rateLimit(apiKey: string): Promise<RateLimitResult> {
  try {
    // Skip rate limiting for custom API keys
    if (apiKey !== process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return { success: true };
    }

    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Rate limiting disabled in development');
      return { success: true };
    }

    // Get current timestamps
    const now = Date.now();
    const minuteKey = `rate_limit:${apiKey}:minute`;
    const dayKey = `rate_limit:${apiKey}:day`;

    // Get current counts
    const minuteResult = await kv.get<number>(minuteKey);
    const dayResult = await kv.get<number>(dayKey);
    
    // Convert null to 0
    const minuteCount = minuteResult || 0;
    const dayCount = dayResult || 0;

    // Check limits
    if (minuteCount >= RATE_LIMITS.REQUESTS_PER_MINUTE) {
      return {
        success: false,
        minuteLimit: RATE_LIMITS.REQUESTS_PER_MINUTE,
        minuteRemaining: 0,
        resetIn: 60 // seconds until reset
      };
    }

    if (dayCount >= RATE_LIMITS.REQUESTS_PER_DAY) {
      return {
        success: false,
        dayLimit: RATE_LIMITS.REQUESTS_PER_DAY,
        dayRemaining: 0,
        resetIn: 24 * 60 * 60 // seconds until reset
      };
    }

    // Increment counters
    await Promise.all([
      kv.incr(minuteKey),
      kv.incr(dayKey),
      kv.expire(minuteKey, 60), // Expire after 1 minute
      kv.expire(dayKey, 24 * 60 * 60) // Expire after 24 hours
    ]);

    return {
      success: true,
      minuteLimit: RATE_LIMITS.REQUESTS_PER_MINUTE,
      minuteRemaining: RATE_LIMITS.REQUESTS_PER_MINUTE - (minuteCount + 1),
      dayLimit: RATE_LIMITS.REQUESTS_PER_DAY,
      dayRemaining: RATE_LIMITS.REQUESTS_PER_DAY - (dayCount + 1)
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // If we can't check rate limits, allow the request
    return { success: true };
  }
}

export function formatRateLimitError(result: RateLimitResult): string {
  if (result.minuteRemaining === 0) {
    return `Rate limit exceeded. Please try again in a minute or use your own API key.`;
  }
  if (result.dayRemaining === 0) {
    return `Daily rate limit exceeded. Please try again tomorrow or use your own API key.`;
  }
  return `Rate limit error. Please try again later or use your own API key.`;
} 