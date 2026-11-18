import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'employee'], required: true },
  active: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0 },
  profileImage: String,
}, { timestamps: true });
userSchema.set('toJSON', { transform(_doc, result) { delete result.password; delete result.tokenVersion; return result; } });
export default mongoose.model('User', userSchema);
