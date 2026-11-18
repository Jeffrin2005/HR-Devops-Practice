import mongoose from 'mongoose';
const employeeSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeID: { type: String, required: true, unique: true, trim: true, maxlength: 200 },
  dob: Date,
  gender: { type: String, maxlength: 200 },
  maritalStatus: { type: String, maxlength: 200 },
  designation: { type: String, maxlength: 200 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  salary: { type: Number, required: true, min: 0 },
}, { timestamps: true });
employeeSchema.index({ department: 1 });
export default mongoose.model('Employee', employeeSchema);
