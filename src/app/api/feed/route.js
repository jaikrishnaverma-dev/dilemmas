import connectDB from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Verdict from '@/lib/models/Verdict';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/**
 * GET /api/feed
 * Public feed — infinite scroll of live cases.
 * 
 * Query params:
 *   page, limit, sort (trending|latest|expiring), category, city
 *   since: ISO timestamp — returns only cases created after this time (for new-feed polling)
 *   countOnly: "true" — returns only the count of new cases since `since` (lightweight poll)
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const countOnly = searchParams.get('countOnly') === 'true';

    // ── Lightweight poll: just count new cases since a timestamp ──
    if (since && countOnly) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) return errorResponse('Invalid since timestamp', 422);

      const newCount = await Case.countDocuments({
        status: 'live',
        expiresAt: { $gt: new Date() },
        createdAt: { $gt: sinceDate },
      });
      return successResponse({ newCount, since }, 'New cases count');
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const sort = searchParams.get('sort') || 'latest';
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    // Build query — only live and not expired
    const query = { status: 'live', expiresAt: { $gt: new Date() } };
    if (category) query.category = category;
    if (city) query.city = { $regex: new RegExp(city, 'i') };

    // If since is provided (without countOnly), return new cases since that time
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }

    // Sort options
    let sortOption;
    switch (sort) {
      case 'trending': sortOption = { voteCount: -1, createdAt: -1 }; break;
      case 'expiring': sortOption = { expiresAt: 1 }; break;
      case 'latest': // fall through — default
      default: sortOption = { createdAt: -1 }; break;
    }

    const skip = (page - 1) * limit;
    const [cases, total] = await Promise.all([
      Case.find(query).select('title context category city shareSlug voteCount expiresAt createdAt userId').sort(sortOption).skip(skip).limit(limit).lean(),
      Case.countDocuments(query),
    ]);

    // For each case, get vote split counts
    const casesWithSplits = await Promise.all(
      cases.map(async (c) => {
        const splits = await Verdict.aggregate([
          { $match: { caseId: c._id } },
          { $group: { _id: '$side', count: { $sum: 1 } } },
        ]);

        const voteSplit = { teri_galti: 0, uski_galti: 0, situation_galat: 0 };
        splits.forEach((s) => { voteSplit[s._id] = s.count; });

        return {
          id: c._id,
          title: c.title,
          context: c.context,
          category: c.category,
          city: c.city,
          shareSlug: c.shareSlug,
          voteCount: c.voteCount,
          voteSplit,
          expiresAt: c.expiresAt,
          createdAt: c.createdAt,
          userId: c.userId,
        };
      })
    );

    return successResponse({
      cases: casesWithSplits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }, 'Feed loaded');

  } catch (err) {
    console.error('Feed error:', err);
    return errorResponse('Feed load nahi hua', 500);
  }
}
