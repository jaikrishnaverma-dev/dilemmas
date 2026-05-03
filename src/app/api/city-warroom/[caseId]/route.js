import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import Case from '@/lib/models/Case';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

/** GET /api/city-warroom/[caseId] — City vs city breakdown for a case */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { caseId } = await params;

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return errorResponse('Invalid case ID', 400);
    }

    const objectId = new mongoose.Types.ObjectId(caseId);
    const caseDoc = await Case.findById(objectId).select('title shareSlug').lean();
    if (!caseDoc) return errorResponse('Case nahi mila', 404);

    // City breakdown with dominant side per city
    const cityBreakdown = await Verdict.aggregate([
      { $match: { caseId: objectId, city: { $ne: '' } } },
      { $group: { _id: { city: '$city', side: '$side' }, count: { $sum: 1 } } },
      { $group: {
        _id: '$_id.city',
        sides: { $push: { side: '$_id.side', count: '$count' } },
        totalVotes: { $sum: '$count' },
      }},
      { $sort: { totalVotes: -1 } },
      { $limit: 15 },
    ]);

    // Format with percentages
    const cities = cityBreakdown.map((city) => {
      const formatted = { city: city._id, totalVotes: city.totalVotes, sides: {} };
      city.sides.forEach((s) => {
        formatted.sides[s.side] = {
          count: s.count,
          percent: Math.round((s.count / city.totalVotes) * 100),
        };
      });
      // Find dominant side
      const dominant = city.sides.reduce((a, b) => a.count > b.count ? a : b);
      formatted.dominantSide = dominant.side;
      formatted.dominantPercent = Math.round((dominant.count / city.totalVotes) * 100);
      return formatted;
    });

    return successResponse({
      caseTitle: caseDoc.title,
      caseSlug: caseDoc.shareSlug,
      cities,
    }, 'War room data loaded 🏙️');
  } catch (err) {
    console.error('City warroom error:', err);
    return errorResponse('War room data nahi aaya', 500);
  }
}
