import connectDB from '@/lib/mongodb';
import JudgeScore from '@/lib/models/JudgeScore';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

/** GET /api/judge-score/[userId] — Get a user's judge score */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse('Invalid user ID', 400);
    }

    const [score, user] = await Promise.all([
      JudgeScore.findOne({ userId }).lean(),
      User.findById(userId).select('username city avatarUrl').lean(),
    ]);

    if (!user) return errorResponse('User nahi mila', 404);

    // Calculate progress to next badge
    const badgeThresholds = {
      none: { next: 'nyayadhish', required: 50 },
      nyayadhish: { next: 'street_smart', required: 100 },
      street_smart: { next: 'dil_se', required: 200 },
      dil_se: { next: 'devils_advocate', required: 500 },
      devils_advocate: { next: null, required: null },
    };

    const currentBadge = score?.currentBadge || 'none';
    const threshold = badgeThresholds[currentBadge];
    const remaining = threshold.required ? Math.max(0, threshold.required - (score?.totalVerdicts || 0)) : 0;

    return successResponse({
      username: user.username,
      city: user.city,
      avatarUrl: user.avatarUrl,
      totalVerdicts: score?.totalVerdicts || 0,
      fairRatings: score?.fairRatings || 0,
      score: score?.score || 0,
      currentBadge,
      nextBadge: threshold.next,
      verdictsToNextBadge: remaining,
    }, 'Judge score loaded');
  } catch (err) {
    console.error('Judge score error:', err);
    return errorResponse('Score load nahi hua', 500);
  }
}
