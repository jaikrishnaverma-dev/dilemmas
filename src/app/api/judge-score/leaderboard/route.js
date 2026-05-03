import connectDB from '@/lib/mongodb';
import JudgeScore from '@/lib/models/JudgeScore';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/judge-score/leaderboard — City-wise leaderboard */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const query = {};
    if (city) query.city = { $regex: new RegExp(city, 'i') };

    const leaderboard = await JudgeScore.find(query)
      .sort({ score: -1 })
      .limit(limit)
      .populate('userId', 'username city avatarUrl')
      .lean();

    const formatted = leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.userId?.username || 'Anonymous',
      city: entry.city,
      score: entry.score,
      badge: entry.currentBadge,
      totalVerdicts: entry.totalVerdicts,
      avatarUrl: entry.userId?.avatarUrl || '',
    }));

    return successResponse({ leaderboard: formatted }, 'Leaderboard loaded 🏆');
  } catch (err) {
    console.error('Leaderboard error:', err);
    return errorResponse('Leaderboard load nahi hua', 500);
  }
}
