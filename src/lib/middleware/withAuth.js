import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { extractToken, verifyToken } from '@/lib/jwt';
import { errorResponse } from '@/lib/apiResponse';

/**
 * Auth middleware — wraps API route handlers.
 * Verifies JWT, attaches user to the handler.
 * Returns 401 if token missing/invalid.
 */
export function withAuth(handler) {
  return async (request, context) => {
    const token = extractToken(request);
    if (!token) {
      return errorResponse('Login karo pehle! 🔐', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Session expired. Phir se login karo.', 401);
    }

    await connectDB();
    const user = await User.findById(decoded.userId).select('-passwordHash').lean();
    if (!user) {
      return errorResponse('User not found', 401);
    }

    // Attach user to request for the handler
    request.user = user;
    return handler(request, context);
  };
}

/**
 * Guest-or-Auth middleware — allows unauthenticated access
 * but attaches user if token is present and valid.
 */
export function withGuestOrAuth(handler) {
  return async (request, context) => {
    const token = extractToken(request);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        await connectDB();
        const user = await User.findById(decoded.userId).select('-passwordHash').lean();
        if (user) {
          request.user = user;
        }
      }
    }
    return handler(request, context);
  };
}
