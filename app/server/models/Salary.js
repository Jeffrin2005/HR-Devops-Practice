import mongoose from 'mongoose';
const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  basicSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true, min: 0 },
  payDate: { type: Date, required: true },
}, { timestamps: true });
salarySchema.index({ employeeId: 1, payDate: 1 }, { unique: true });
export default mongoose.model('Salary', salarySchema);
