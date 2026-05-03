import connectDB from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/search?q=term&type=cases|users */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all'; // 'cases' | 'users' | 'all'
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'));

    if (!q || q.length < 2) {
      return errorResponse('Search term kam se kam 2 characters hona chahiye', 422);
    }

    await connectDB();
    const regex = new RegExp(q, 'i');
    const results = { cases: [], users: [] };

    // Search cases
    if (type === 'cases' || type === 'all') {
      results.cases = await Case.find({
        $or: [
          { title: regex },
          { context: regex },
          { category: regex },
          { city: regex },
        ],
        status: 'live',
      })
        .sort({ voteCount: -1, createdAt: -1 })
        .limit(limit)
        .select('title category city voteCount shareSlug expiresAt createdAt')
        .lean();
    }

    // Search users
    if (type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [
          { username: regex },
          { city: regex },
        ],
      })
        .limit(limit)
        .select('username city gender avatarUrl createdAt')
        .lean();
    }

    return successResponse(results, `${results.cases.length + results.users.length} results found`);
  } catch (err) {
    console.error('Search error:', err);
    return errorResponse('Search failed', 500);
  }
}
