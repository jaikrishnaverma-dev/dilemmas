import connectDB from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Verdict from '@/lib/models/Verdict';
import { withAuth } from '@/lib/middleware/withAuth';
import { withRateLimit } from '@/lib/middleware/withRateLimit';
import { successResponse, errorResponse } from '@/lib/apiResponse';

function generateSlug(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/** POST /api/cases — Submit a new case (auth required, rate limited) */
async function createCase(request) {
  try {
    const body = await request.json();
    const { title, context, category } = body;

    // Validate
    const errors = {};
    if (!title || title.trim().length < 5) errors.title = 'Title kam se kam 5 characters ka hona chahiye';
    if (!title || title.trim().length > 150) errors.title = 'Title 150 characters se zyada nahi';
    if (!context || context.trim().length < 20) errors.context = 'Context mein kam se kam 20 characters daalo';
    if (!category) errors.category = 'Category chuno';

    if (Object.keys(errors).length > 0) {
      return errorResponse('Validation failed', 422, errors);
    }

    await connectDB();

    const user = request.user;
    const shareSlug = generateSlug();

    const newCase = await Case.create({
      userId: user._id,
      title: title.trim(),
      context: context.trim(),
      category,
      status: 'live', // Auto-live for now (can add moderation later)
      city: user.city || '',
      ageBracket: user.ageBracket || '',
      expiresAt: new Date(Date.now() + 48 * 3600000), // 48 hours
      shareSlug,
      voteCount: 0,
    });

    return successResponse({
      id: newCase._id,
      shareSlug: newCase.shareSlug,
      expiresAt: newCase.expiresAt,
    }, 'Case submit ho gaya! 🎉', 201);

  } catch (err) {
    console.error('Create case error:', err);
    return errorResponse('Case submit nahi hua 😵', 500);
  }
}

export const POST = withAuth(withRateLimit(createCase, 'case_submit', 5, 3600));

/** GET /api/cases — Get cases list (for categories page, etc.) */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query = { status: 'live', expiresAt: { $gt: new Date() } };
    if (category) query.category = category;

    const cases = await Case.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title category city voteCount shareSlug expiresAt createdAt')
      .lean();

    return successResponse({ cases }, 'Cases loaded');
  } catch (err) {
    console.error('Get cases error:', err);
    return errorResponse('Cases load nahi hue', 500);
  }
}
