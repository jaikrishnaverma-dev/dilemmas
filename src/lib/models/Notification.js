import mongoose from 'mongoose';

/** NOTIFICATION MODULE — Activity alerts for users */
const NotificationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:     { type: String, enum: ['verdict_on_case', 'fairness_rating', 'badge_earned', 'case_expired', 'case_trending'], required: true },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  link:     { type: String, default: '' },   // Internal link (e.g. /case/xK9mQ2pL)
  read:     { type: Boolean, default: false, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Extra data (caseId, verdictId, etc.)
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
