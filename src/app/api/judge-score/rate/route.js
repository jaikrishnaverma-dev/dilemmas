import connectDB from '@/lib/mongodb';
import FairnessRating from '@/lib/models/FairnessRating';
import JudgeScore from '@/lib/models/JudgeScore';
import Verdict from '@/lib/models/Verdict';
import { withAuth } from '@/lib/middleware/withAuth';
import { withRateLimit } from '@/lib/middleware/withRateLimit';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** POST /api/judge-score/rate — Rate a verdict as fair/unfair */
async function handler(request) {
  try {
    const body = await request.json();
    const { verdictId, isFair } = body;

    if (!verdictId || typeof isFair !== 'boolean') {
      return errorResponse('verdictId and isFair (boolean) required', 422);
    }

    await connectDB();

    const verdict = await Verdict.findById(verdictId);
    if (!verdict) return errorResponse('Verdict nahi mila', 404);

    // Can't rate your own verdict
    if (verdict.userId?.toString() === request.user._id.toString()) {
      return errorResponse('Apna hi vote rate nahi kar sakte 😅', 400);
    }

    // Create or update rating
    await FairnessRating.findOneAndUpdate(
      { verdictId, ratedByUser: request.user._id },
      { isFair },
      { upsert: true }
    );

    // Recalculate judge score for the verdict owner
    if (verdict.userId) {
      const fairCount = await FairnessRating.countDocuments({
        verdictId: { $in: await Verdict.find({ userId: verdict.userId }).distinct('_id') },
        isFair: true,
      });
      const totalRatings = await FairnessRating.countDocuments({
        verdictId: { $in: await Verdict.find({ userId: verdict.userId }).distinct('_id') },
      });

      const score = totalRatings > 0 ? Math.round((fairCount / totalRatings) * 100 * 100) / 100 : 0;

      await JudgeScore.findOneAndUpdate(
        { userId: verdict.userId },
        { fairRatings: fairCount, score },
        { upsert: true }
      );
    }

    return successResponse(null, isFair ? 'Fair rating diya! ⚖️' : 'Unfair rating diya');
  } catch (err) {
    console.error('Rate error:', err);
    return errorResponse('Rating nahi hua', 500);
  }
}

export const POST = withAuth(withRateLimit(handler, 'rating', 60, 3600));
