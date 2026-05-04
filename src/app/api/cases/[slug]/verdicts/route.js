import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

/** GET /api/cases/[slug]/verdicts — Voters list + comments. Supports ?highlight=verdictId to pin a tagged comment on top. */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const Case = (await import('@/lib/models/Case')).default;
    const caseDoc = await Case.findOne({ shareSlug: slug }).lean();
    if (!caseDoc) return errorResponse('Case nahi mila', 404);

    const { searchParams } = new URL(request.url);
    const page      = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit     = Math.min(30, parseInt(searchParams.get('limit') || '15'));
    const side      = searchParams.get('side');
    const highlight = searchParams.get('highlight'); // VerdictId to pin on top

    const query = { caseId: caseDoc._id };
    if (side && ['teri_galti', 'uski_galti', 'situation_galat'].includes(side)) {
      query.side = side;
    }

    // If highlighting a specific verdict, fetch it separately
    let highlightedVerdict = null;
    if (highlight && mongoose.Types.ObjectId.isValid(highlight) && page === 1) {
      highlightedVerdict = await Verdict.findById(highlight).lean();
    }

    const [verdicts, total] = await Promise.all([
      Verdict.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Verdict.countDocuments(query),
    ]);

    // Merge highlight on top if it exists and isn't already in the list
    let allVerdicts = verdicts;
    if (highlightedVerdict && page === 1) {
      const alreadyInList = verdicts.some(v => v._id.toString() === highlightedVerdict._id.toString());
      if (!alreadyInList) {
        allVerdicts = [highlightedVerdict, ...verdicts];
      } else {
        // Move to top
        allVerdicts = [
          highlightedVerdict,
          ...verdicts.filter(v => v._id.toString() !== highlightedVerdict._id.toString()),
        ];
      }
    }

    // Enrich with user info
    const userIds = allVerdicts.map(v => v.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username city avatarUrl')
      .lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const enriched = allVerdicts.map(v => {
      const u = v.userId ? userMap[v.userId.toString()] : null;
      return {
        id: v._id,
        type: v.type || 'verdict',
        side: v.side,
        reason: v.reason,
        city: v.city,
        gender: v.gender,
        createdAt: v.createdAt,
        isHighlighted: highlight && v._id.toString() === highlight,
        user: u ? {
          id: u._id,
          username: u.username,
          city: u.city,
          avatarUrl: u.avatarUrl,
        } : { id: null, username: 'Anonymous', city: '', avatarUrl: '' },
      };
    });

    return successResponse({
      verdicts: enriched,
      pagination: { page, limit, total, hasMore: page * limit < total },
    }, 'Verdicts loaded');
  } catch (err) {
    console.error('Case verdicts error:', err);
    return errorResponse('Verdicts load nahi hue', 500);
  }
}
