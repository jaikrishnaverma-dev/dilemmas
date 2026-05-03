import mongoose from 'mongoose';

/** CASES MODULE — Submitted dilemma cases */
const CaseSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title:      { type: String, required: true, maxlength: 150 },
  context:    { type: String, required: true },
  category:   { type: String, required: true, index: true },
  status:     { type: String, enum: ['pending', 'live', 'expired', 'removed'], default: 'pending', index: true },
  city:       { type: String, default: '', index: true },
  ageBracket: { type: String, default: '' },
  expiresAt:  { type: Date, required: true, index: true },
  shareSlug:  { type: String, unique: true, required: true, index: true },
  voteCount:  { type: Number, default: 0, index: true },
}, { timestamps: true });

// Compound indexes for feed queries
CaseSchema.index({ status: 1, expiresAt: -1 });
CaseSchema.index({ status: 1, voteCount: -1 });
CaseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
