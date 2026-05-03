import connectDB from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Verdict from '@/lib/models/Verdict';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/cases/[slug] — Get a single case by share slug */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const caseDoc = await Case.findOne({ shareSlug: slug }).lean();
    if (!caseDoc) {
      return errorResponse('Case nahi mila 🤷', 404);
    }

    // Get vote splits
    const splits = await Verdict.aggregate([
      { $match: { caseId: caseDoc._id } },
      { $group: { _id: '$side', count: { $sum: 1 } } },
    ]);

    const voteSplit = { teri_galti: 0, uski_galti: 0, situation_galat: 0 };
    splits.forEach((s) => { voteSplit[s._id] = s.count; });

    // Get top reasons
    const topReasons = await Verdict.find({ caseId: caseDoc._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('side reason city gender createdAt')
      .lean();

    return successResponse({
      id: caseDoc._id,
      title: caseDoc.title,
      context: caseDoc.context,
      category: caseDoc.category,
      city: caseDoc.city,
      shareSlug: caseDoc.shareSlug,
      voteCount: caseDoc.voteCount,
      voteSplit,
      topReasons,
      expiresAt: caseDoc.expiresAt,
      createdAt: caseDoc.createdAt,
      status: caseDoc.status,
    }, 'Case loaded');

  } catch (err) {
    console.error('Get case error:', err);
    return errorResponse('Case load nahi hua', 500);
  }
}
