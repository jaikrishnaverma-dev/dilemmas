import mongoose from 'mongoose';

/** JUDGE SCORE MODULE — Accumulated judge identity */
const JudgeScoreSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  totalVerdicts: { type: Number, default: 0 },
  fairRatings:   { type: Number, default: 0 },
  score:         { type: Number, default: 0, index: true },
  currentBadge:  { type: String, enum: ['none', 'nyayadhish', 'street_smart', 'dil_se', 'devils_advocate'], default: 'none', index: true },
  city:          { type: String, default: '', index: true },
}, { timestamps: true });

export default mongoose.models.JudgeScore || mongoose.model('JudgeScore', JudgeScoreSchema);
