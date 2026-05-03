import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import Case from '@/lib/models/Case';
import ShareCard from '@/lib/models/ShareCard';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

function generateShareUrl(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let url = '';
  for (let i = 0; i < length; i++) url += chars.charAt(Math.floor(Math.random() * chars.length));
  return url;
}

/** POST /api/share/generate — Generate a share card for a verdict */
async function handler(request) {
  try {
    const body = await request.json();
    const { verdictId } = body;
    if (!verdictId) return errorResponse('Verdict ID required', 422);

    await connectDB();

    const verdict = await Verdict.findById(verdictId).lean();
    if (!verdict) return errorResponse('Verdict nahi mila', 404);

    const caseDoc = await Case.findById(verdict.caseId).lean();
    if (!caseDoc) return errorResponse('Case nahi mila', 404);

    // Calculate agree percentage
    const totalVotes = await Verdict.countDocuments({ caseId: verdict.caseId });
    const sameVotes = await Verdict.countDocuments({ caseId: verdict.caseId, side: verdict.side });
    const agreePercent = totalVotes > 0 ? Math.round((sameVotes / totalVotes) * 100) : 0;

    // Check if share card already exists for this verdict
    let shareCard = await ShareCard.findOne({ verdictId });
    if (!shareCard) {
      shareCard = await ShareCard.create({
        verdictId,
        userId: request.user._id,
        shareUrl: generateShareUrl(),
        cardData: {
          caseTitle: caseDoc.title,
          side: verdict.side,
          reason: verdict.reason,
          agreePercent,
          caseSlug: caseDoc.shareSlug,
        },
      });
    }

    return successResponse({
      shareUrl: shareCard.shareUrl,
      cardData: shareCard.cardData,
      fullUrl: `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareCard.shareUrl}`,
    }, 'Share card ready! 🔗');
  } catch (err) {
    console.error('Share generate error:', err);
    return errorResponse('Share card nahi bana', 500);
  }
}

export const POST = withAuth(handler);
