import mongoose from 'mongoose';

/** JUDGE SCORE MODULE — Fair/unfair ratings on verdicts */
const FairnessRatingSchema = new mongoose.Schema({
  verdictId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Verdict', required: true, index: true },
  ratedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFair:      { type: Boolean, required: true },
}, { timestamps: true });

FairnessRatingSchema.index({ verdictId: 1, ratedByUser: 1 }, { unique: true });

export default mongoose.models.FairnessRating || mongoose.model('FairnessRating', FairnessRatingSchema);
