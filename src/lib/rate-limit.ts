import { kv } from '@vercel/kv';

const MINUTE_IN_MS = 60 * 1000;
const DAY_IN_MS = 24 * 60 * MINUTE_IN_MS;

interface RateLimitResult {
  success: boolean;
  limit: string;
  current: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(apiKey: string): Promise<RateLimitResult> {
  const now = Date.now();
  const minuteKey = `rate_limit:${apiKey}:minute:${Math.floor(now / MINUTE_IN_MS)}`;
  const dayKey = `rate_limit:${apiKey}:day:${Math.floor(now / DAY_IN_MS)}`;

  try {
    // Get current counts with proper null handling
    const [minuteCountResult, dayCountResult] = await Promise.all([
      kv.get<number>(minuteKey),
      kv.get<number>(dayKey)
    ]);

    // Convert null to 0
    const minuteCount = minuteCountResult ?? 0;
    const dayCount = dayCountResult ?? 0;

    // Check minute limit (15 RPM)
    if (minuteCount >= 15) {
      const resetTime = Math.ceil(now / MINUTE_IN_MS) * MINUTE_IN_MS;
      return {
        success: false,
        limit: 'minute',
        current: minuteCount,
        remaining: 0,
        reset: resetTime
      };
    }

    // Check day limit (1,500 RPD)
    if (dayCount >= 1500) {
      const resetTime = Math.ceil(now / DAY_IN_MS) * DAY_IN_MS;
      return {
        success: false,
        limit: 'day',
        current: dayCount,
        remaining: 0,
        reset: resetTime
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
      limit: 'none',
      current: Math.max(minuteCount, dayCount) + 1,
      remaining: Math.min(15 - (minuteCount + 1), 1500 - (dayCount + 1)),
      reset: Math.min(
        Math.ceil(now / MINUTE_IN_MS) * MINUTE_IN_MS,
        Math.ceil(now / DAY_IN_MS) * DAY_IN_MS
      )
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // If rate limiting fails, allow the request but log the error
    return {
      success: true,
      limit: 'error',
      current: 0,
      remaining: 1,
      reset: now + MINUTE_IN_MS
    };
  }
}

export function formatRateLimitError(result: RateLimitResult): string {
  const resetDate = new Date(result.reset);
  const timeUntilReset = Math.ceil((result.reset - Date.now()) / 1000);
  
  if (result.limit === 'minute') {
    return `Rate limit exceeded: 15 requests per minute. Please try again in ${timeUntilReset} seconds or use your own API key.`;
  } else if (result.limit === 'day') {
    return `Rate limit exceeded: 1,500 requests per day. Please try again after ${resetDate.toLocaleTimeString()} or use your own API key.`;
  }
  return 'Unknown rate limit error. Please try again later.';
} 