import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import JudgeScore from '@/lib/models/JudgeScore';
import Verdict from '@/lib/models/Verdict';
import Case from '@/lib/models/Case';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/users/[username] — Get a public user profile */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await User.findOne({ username: username.toLowerCase().trim() })
      .select('username city state gender ageBracket avatarUrl createdAt')
      .lean();

    if (!user) return errorResponse('User nahi mila', 404);

    // Get judge score
    const judgeScore = await JudgeScore.findOne({ userId: user._id }).lean();

    // Get recent verdicts with case info
    const recentVerdicts = await Verdict.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Enrich verdicts with case titles
    const caseIds = [...new Set(recentVerdicts.map(v => v.caseId.toString()))];
    const cases = await Case.find({ _id: { $in: caseIds } })
      .select('title shareSlug category')
      .lean();
    const caseMap = {};
    cases.forEach(c => { caseMap[c._id.toString()] = c; });

    const enrichedVerdicts = recentVerdicts.map(v => ({
      id: v._id,
      side: v.side,
      reason: v.reason,
      createdAt: v.createdAt,
      case: caseMap[v.caseId.toString()] ? {
        title: caseMap[v.caseId.toString()].title,
        shareSlug: caseMap[v.caseId.toString()].shareSlug,
        category: caseMap[v.caseId.toString()].category,
      } : null,
    }));

    // Get cases submitted by this user
    const submittedCases = await Case.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category city voteCount shareSlug expiresAt status createdAt')
      .lean();

    return successResponse({
      user: {
        id: user._id,
        username: user.username,
        city: user.city,
        state: user.state,
        gender: user.gender,
        ageBracket: user.ageBracket,
        avatarUrl: user.avatarUrl,
        joinedAt: user.createdAt,
      },
      judgeScore: judgeScore ? {
        totalVerdicts: judgeScore.totalVerdicts,
        fairRatings: judgeScore.fairRatings,
        score: judgeScore.score,
        currentBadge: judgeScore.currentBadge,
      } : null,
      recentVerdicts: enrichedVerdicts,
      submittedCases,
    }, 'Profile loaded');
  } catch (err) {
    console.error('User profile error:', err);
    return errorResponse('Profile load nahi hua', 500);
  }
}
