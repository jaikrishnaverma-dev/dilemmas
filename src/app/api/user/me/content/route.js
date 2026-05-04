import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Case from '@/lib/models/Case';
import Verdict from '@/lib/models/Verdict';
import { verifyToken, extractToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/user/me/content */
export async function GET(request) {
  try {
    const token = extractToken(request);
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Fetch user's cases (posted by them)
    const myCases = await Case.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Fetch user's verdicts (voted by them)
    // We populate the case info to show what they voted on
    const myVerdicts = await Verdict.find({ userId: decoded.userId })
      .populate('caseId', 'title shareSlug category createdAt expiresAt voteCount')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse({
      cases: myCases,
      verdicts: myVerdicts
    });

  } catch (err) {
    console.error('Fetch user content error:', err);
    return errorResponse('Failed to fetch profile content', 500);
  }
}
