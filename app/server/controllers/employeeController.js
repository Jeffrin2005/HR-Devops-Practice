import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import bcrypt from 'bcrypt';
import { upload, saveImage, removeImage } from '../lib/uploads.js';
export { upload };
export const addEmployee = async (req, res) => {
  const { name, email, password, role, ...employeeData } = req.body;
  if (!await Department.exists({ _id: employeeData.department, archived: { $ne: true } })) return res.status(400).json({ success: false, error: 'Select an active department' });
  const hash = await bcrypt.hash(password, 12);
  const profileImage = await saveImage(req.file);
  try {
    await mongoose.connection.transaction(async session => {
      const [user] = await User.create([{ name, email, password: hash, role, profileImage }], { session });
      await Employee.create([{ ...employeeData, userID: user._id }], { session });
    });
  } catch (error) { await removeImage(profileImage); throw error; }
  res.status(201).json({ success: true, message: 'Employee created successfully' });
};
export const getEmployees = async (_req, res) => {
  const employees = await Employee.find().populate('userID', 'name email profileImage role').populate('department');
  res.json({ success: true, employees });
};
export const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.employee._id).populate('userID', 'name email profileImage role').populate('department');
  res.json({ success: true, employee });
};
export const updateEmployee = async (req, res) => {
  const { name, ...fields } = req.body;
  if (fields.department && !await Department.exists({ _id: fields.department, archived: { $ne: true } })) return res.status(400).json({ success: false, error: 'Select an active department' });
  await mongoose.connection.transaction(async session => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true, session });
    if (!employee) throw Object.assign(new Error('Employee not found'), { status: 404 });
    if (name && !await User.findByIdAndUpdate(employee.userID, { name }, { runValidators: true, session })) throw Object.assign(new Error('User not found'), { status: 404 });
  });
  res.json({ success: true, message: 'Employee updated successfully' });
};
export const fetchEmployeesByDepId = async (req, res) => {
  const employees = await Employee.find({ department: req.params.id }).select('_id employeeID');
  res.json({ success: true, employees });
};
