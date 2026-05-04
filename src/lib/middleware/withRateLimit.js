import connectDB from '@/lib/mongodb';
import RateLimit from '@/lib/models/RateLimit';
import { errorResponse } from '@/lib/apiResponse';

/**
 * Rate limiting middleware HOF.
 * @param {Function} handler — the route handler to wrap
 * @param {string} endpointKey — unique key for this endpoint type
 * @param {number} maxRequests — max requests per window
 * @param {number} windowSeconds — time window in seconds
 * @param {string} [limitMessage] — custom message shown when limit is exceeded
 */
export function withRateLimit(handler, endpointKey = 'default', maxRequests = 30, windowSeconds = 3600, limitMessage = '') {
  return async (request, context) => {
    await connectDB();

    // Identify by user ID or IP
    const userId = request.user?._id?.toString();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const identifier = userId ? `user_${userId}` : `ip_${ip}`;
    const key = `${endpointKey}:${identifier}`;

    const existing = await RateLimit.findOne({ key });

    if (existing) {
      if (existing.requestCount >= maxRequests) {
        // Calculate time remaining until reset
        const msLeft = existing.expiresAt.getTime() - Date.now();
        const minsLeft = Math.max(1, Math.ceil(msLeft / 60000));

        const defaultMsg = `Limit reached: max ${maxRequests} requests per ${windowSeconds / 60} minutes. Try again in ~${minsLeft} min ⏳`;
        return errorResponse(limitMessage || defaultMsg, 429);
      }
      await RateLimit.updateOne({ key }, { $inc: { requestCount: 1 } });
    } else {
      await RateLimit.create({
        key,
        requestCount: 1,
        expiresAt: new Date(Date.now() + windowSeconds * 1000),
      });
    }

    return handler(request, context);
  };
}
