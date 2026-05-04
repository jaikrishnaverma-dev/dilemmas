import mongoose from 'mongoose';

/** VERDICTS MODULE — User votes on cases */
const VerdictSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  side:   { type: String, enum: ['teri_galti', 'uski_galti', 'situation_galat', 'creator_note'], required: true, index: true },
  reason: { type: String, required: true, maxlength: 280 },
  city:   { type: String, default: '', index: true },
  gender: { type: String, default: '' },
}, { timestamps: true });

// One vote per user per case
VerdictSchema.index({ userId: 1, caseId: 1 }, { unique: true });
// For city/gender breakdown queries
VerdictSchema.index({ caseId: 1, side: 1 });
VerdictSchema.index({ caseId: 1, city: 1 });
VerdictSchema.index({ caseId: 1, gender: 1 });

export default mongoose.models.Verdict || mongoose.model('Verdict', VerdictSchema);
