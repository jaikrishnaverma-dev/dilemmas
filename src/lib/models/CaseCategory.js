import mongoose from 'mongoose';

/** CASES MODULE — Category tags for cases */
const CaseCategorySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  slug:         { type: String, required: true, unique: true },
  emoji:        { type: String, default: '🤔' },
  displayOrder: { type: Number, default: 0 },
});

export default mongoose.models.CaseCategory || mongoose.model('CaseCategory', CaseCategorySchema);
