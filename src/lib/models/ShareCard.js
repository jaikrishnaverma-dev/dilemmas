import mongoose from 'mongoose';

/** SHARE MODULE — Generated share cards */
const ShareCardSchema = new mongoose.Schema({
  verdictId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verdict', required: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cardData:  { type: mongoose.Schema.Types.Mixed },
  shareUrl:  { type: String, unique: true, index: true },
  clicks:    { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.ShareCard || mongoose.model('ShareCard', ShareCardSchema);
