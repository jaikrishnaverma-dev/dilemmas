import connectDB from '@/lib/mongodb';
import Verdict from '@/lib/models/Verdict';
import Case from '@/lib/models/Case';
import JudgeScore from '@/lib/models/JudgeScore';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { withAuth } from '@/lib/middleware/withAuth';
import { withRateLimit } from '@/lib/middleware/withRateLimit';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** POST /api/verdicts — Cast a verdict (auth required, rate limited) */
async function castVerdict(request) {
  try {
    const body = await request.json();
    const { caseId, side, reason, type = 'verdict' } = body;

    // Validate
    const validSides = ['teri_galti', 'uski_galti', 'situation_galat', 'creator_note'];
    const validType = ['verdict', 'comment'];
    if (!caseId) return errorResponse('Case ID required', 422);
    if (!validType.includes(type)) return errorResponse('Invalid type', 422);
    if (!side || !validSides.includes(side)) return errorResponse('Valid side chuno', 422);
    if (!reason || reason.trim().length < 3) return errorResponse('Reason dena zaroori hai bhai 🙏', 422);
    if (reason.trim().length > 280) return errorResponse('Reason 280 characters se kam rakho', 422);

    await connectDB();

    const user = request.user;

    // Check case exists and is live
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return errorResponse('Case nahi mila', 404);
    if (caseDoc.status !== 'live' || caseDoc.expiresAt < new Date()) {
      return errorResponse('Case ka time khatam ho gaya ⏰', 400);
    }

    // Restriction: Creator cannot vote on their own case, but they can comment
    const isCreator = caseDoc.userId && caseDoc.userId.toString() === user._id.toString();
    const finalSide = isCreator ? 'creator_note' : side;
    const finalType = isCreator ? 'comment' : type;

    // Logic for Verdict vs Comment
    if (finalType === 'verdict') {
      // Find if user already has a verdict for this case
      let existingVerdict = await Verdict.findOne({ caseId, userId: user._id, type: 'verdict' });
      
      if (existingVerdict) {
        // UPDATE existing verdict
        existingVerdict.side = finalSide;
        existingVerdict.reason = reason.trim();
        await existingVerdict.save();
        
        return successResponse({
          verdictId: existingVerdict._id,
          side: existingVerdict.side,
          updated: true
        }, 'Verdict update ho gaya! 🔄', 200);
      }
    }

    // Create new verdict or comment
    const verdict = await Verdict.create({
      caseId,
      userId: user._id,
      type: finalType,
      side: finalSide,
      reason: reason.trim(),
      city: user.city || '',
      gender: user.gender || '',
    });

    // Only increment vote count and judge score if it's a NEW VERDICT (not a comment or creator note)
    if (!isCreator && finalType === 'verdict') {
      // Increment vote count on case
      await Case.findByIdAndUpdate(caseId, { $inc: { voteCount: 1 } });

      // Update judge score
      await JudgeScore.findOneAndUpdate(
        { userId: user._id },
        {
          $inc: { totalVerdicts: 1 },
          $setOnInsert: { city: user.city || '', currentBadge: 'none', fairRatings: 0, score: 0 },
        },
        { upsert: true }
      );
    }

    // Notify case owner (don't notify yourself)
    if (caseDoc.userId && caseDoc.userId.toString() !== user._id.toString()) {
      Notification.create({
        userId: caseDoc.userId,
        type: finalType === 'verdict' ? 'verdict_on_case' : 'comment_on_case',
        title: finalType === 'verdict' ? 'Naya verdict aaya!' : 'Naya comment aaya!',
        message: `@${user.username} ne "${caseDoc.title.substring(0, 50)}" pe ${finalType === 'verdict' ? 'vote' : 'comment'} kiya`,
        link: `/case/${caseDoc.shareSlug}`,
        metadata: { caseId, verdictId: verdict._id, side },
      }).catch(() => {}); // Fire and forget
    }

    // Parse @mentions in reason and notify tagged users
    const mentions = reason.match(/@([a-zA-Z0-9_]+)/g);
    if (mentions?.length) {
      const usernames = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];
      // Don't notify yourself
      const filteredUsernames = usernames.filter(u => u !== user.username.toLowerCase());

      if (filteredUsernames.length > 0) {
        const taggedUsers = await User.find({ username: { $in: filteredUsernames } }).select('_id username').lean();
        for (const tagged of taggedUsers) {
          Notification.create({
            userId: tagged._id,
            type: 'verdict_on_case',
            title: `@${user.username} ne tujhe tag kiya!`,
            message: `"${reason.substring(0, 80)}${reason.length > 80 ? '...' : ''}" — "${caseDoc.title.substring(0, 40)}" pe`,
            link: `/case/${caseDoc.shareSlug}?highlight=${verdict._id}`,
            metadata: { caseId, verdictId: verdict._id, side, taggedBy: user.username },
          }).catch(() => {});
        }
      }
    }

    return successResponse({
      verdictId: verdict._id,
      side: verdict.side,
    }, 'Verdict registered! 🔥', 201);

  } catch (err) {
    if (err.code === 11000) {
      return errorResponse('Tu already vote kar chuka hai ✅', 409);
    }
    console.error('Cast verdict error:', err);
    return errorResponse('Verdict nahi hua 😵', 500);
  }
}

export const POST = withAuth(withRateLimit(castVerdict, 'vote', 60, 3600, 'Ek ghante mein sirf 60 verdicts de sakte ho. Thodi der baad aur cases judge karo! ⚖️'));
