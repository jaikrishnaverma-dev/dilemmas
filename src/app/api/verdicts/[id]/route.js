import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** PATCH /api/verdicts/[id] — Update a comment/verdict */
async function updateVerdict(request, { params }) {
  try {
    const { id } = params;
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 3) return errorResponse('Reason dena zaroori hai bhai 🙏', 422);

    await connectDB();
    const user = request.user;

    const verdict = await Verdict.findById(id);
    if (!verdict) return errorResponse('Comment nahi mila', 404);

    // Only owner can update
    if (verdict.userId.toString() !== user._id.toString()) {
      return errorResponse('Bhai, dusre ka comment edit nahi kar sakte!', 403);
    }

    verdict.reason = reason.trim();
    await verdict.save();

    return successResponse(verdict, 'Comment update ho gaya! 🔄');
  } catch (err) {
    console.error('Update verdict error:', err);
    return errorResponse('Update nahi hua 😵', 500);
  }
}

/** DELETE /api/verdicts/[id] — Delete a comment/verdict */
async function deleteVerdict(request, { params }) {
  try {
    const { id } = params;
    await connectDB();
    const user = request.user;

    const verdict = await Verdict.findById(id);
    if (!verdict) return errorResponse('Comment nahi mila', 404);

    // Only owner can delete
    if (verdict.userId.toString() !== user._id.toString()) {
      return errorResponse('Bhai, dusre ka comment delete nahi kar sakte!', 403);
    }

    await Verdict.findByIdAndDelete(id);

    return successResponse(null, 'Comment delete ho gaya! 🗑️');
  } catch (err) {
    console.error('Delete verdict error:', err);
    return errorResponse('Delete nahi hua 😵', 500);
  }
}

export const PATCH = withAuth(updateVerdict);
export const DELETE = withAuth(deleteVerdict);
