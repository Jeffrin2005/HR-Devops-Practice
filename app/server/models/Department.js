import mongoose from 'mongoose';
// Archive departments so employee, payroll, and attendance history remain intact.
const departmentSchema = new mongoose.Schema({
  dep_name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  archived: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Department', departmentSchema);
