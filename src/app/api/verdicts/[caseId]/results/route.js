import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

/** GET /api/verdicts/[caseId]/results — City + gender breakdown */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { caseId } = await params;

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return errorResponse('Invalid case ID', 400);
    }

    const objectId = new mongoose.Types.ObjectId(caseId);

    // Overall split
    const overallSplit = await Verdict.aggregate([
      { $match: { caseId: objectId } },
      { $group: { _id: '$side', count: { $sum: 1 } } },
    ]);

    // City-wise split
    const citySplit = await Verdict.aggregate([
      { $match: { caseId: objectId, city: { $ne: '' } } },
      { $group: { _id: { city: '$city', side: '$side' }, count: { $sum: 1 } } },
      { $group: {
        _id: '$_id.city',
        splits: { $push: { side: '$_id.side', count: '$count' } },
        total: { $sum: '$count' },
      }},
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Gender-wise split
    const genderSplit = await Verdict.aggregate([
      { $match: { caseId: objectId, gender: { $ne: '' } } },
      { $group: { _id: { gender: '$gender', side: '$side' }, count: { $sum: 1 } } },
      { $group: {
        _id: '$_id.gender',
        splits: { $push: { side: '$_id.side', count: '$count' } },
        total: { $sum: '$count' },
      }},
    ]);

    // Top reasons
    const topReasons = await Verdict.find({ caseId: objectId })
      .sort({ createdAt: -1 })
      .limit(15)
      .select('side reason city gender createdAt')
      .lean();

    const result = { teri_galti: 0, uski_galti: 0, situation_galat: 0 };
    overallSplit.forEach((s) => { result[s._id] = s.count; });

    return successResponse({
      overall: result,
      totalVotes: Object.values(result).reduce((a, b) => a + b, 0),
      citySplit,
      genderSplit,
      topReasons,
    }, 'Results loaded');

  } catch (err) {
    console.error('Results error:', err);
    return errorResponse('Results load nahi hue', 500);
  }
}
