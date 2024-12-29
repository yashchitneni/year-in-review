import { kv } from '@vercel/kv';

const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 15,
  REQUESTS_PER_DAY: 1500
};

export async function rateLimit() {
  try {
    const now = Date.now();
    const minuteSlot = Math.floor(now / 60000); // Current minute
    const daySlot = Math.floor(now / 86400000); // Current day
    
    const minuteKey = `ratelimit:minute:${minuteSlot}`;
    const dayKey = `ratelimit:day:${daySlot}`;

    // Increment counters individually since pipeline typing is problematic
    const minuteCount = await kv.incr(minuteKey);
    const dayCount = await kv.incr(dayKey);

    // Set expiration for counters if they're new
    if (minuteCount === 1) {
      await kv.expire(minuteKey, 60); // Expire after 1 minute
    }
    if (dayCount === 1) {
      await kv.expire(dayKey, 86400); // Expire after 24 hours
    }

    // Check limits
    if (minuteCount > RATE_LIMIT.REQUESTS_PER_MINUTE) {
      return { 
        success: false, 
        error: 'Global rate limit exceeded for this minute. Please try again later.' 
      };
    }

    if (dayCount > RATE_LIMIT.REQUESTS_PER_DAY) {
      return { 
        success: false, 
        error: 'Global daily rate limit exceeded. Please try again tomorrow.' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { success: true }; // Fail open if KV is down
  }
} 