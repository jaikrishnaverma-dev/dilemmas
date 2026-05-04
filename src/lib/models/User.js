import mongoose from 'mongoose';

/** AUTH MODULE — User accounts */
const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, maxlength: 30 },
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:        { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  city:         { type: String, default: '', index: true },
  state:        { type: String, default: '', index: true },
  gender:       { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say', index: true },
  ageBracket:   { type: String, enum: ['13-17', '18-24', '25-34', '35+'], default: '18-24' },
  avatarUrl:    { type: String, default: '' },
  languagePreference: { type: String, enum: ['english', 'hinglish', 'hindi', 'telugu'], default: 'hinglish' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
