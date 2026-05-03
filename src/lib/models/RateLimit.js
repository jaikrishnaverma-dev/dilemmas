import mongoose from 'mongoose';

/** INFRASTRUCTURE — Rate limiting tracker */
const RateLimitSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true, index: true },
  requestCount: { type: Number, default: 1 },
  expiresAt:    { type: Date, required: true, index: true },
});

// TTL index — MongoDB auto-deletes expired entries
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);
