import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
export const addLeave = async (req, res) => {
  const employee = await Employee.findOne({ userID: req.user._id });
  if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
  await Leave.create({ ...req.body, employeeId: employee._id });
  res.status(201).json({ success: true, message: 'Leave added successfully' });
};
export const getLeave = async (req, res) => res.json({ success: true, leaves: await Leave.find({ employeeId: req.employee._id }).sort({ appliedAt: -1 }) });
export const getLeaves = async (_req, res) => {
  const leaves = await Leave.find().populate({ path: 'employeeId', populate: [{ path: 'department', select: 'dep_name' }, { path: 'userID', select: 'name' }] });
  res.json({ success: true, leaves });
};
export const getLeaveDetail = async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate({ path: 'employeeId', populate: [{ path: 'department', select: 'dep_name' }, { path: 'userID', select: 'name profileImage' }] });
  if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
  res.json({ success: true, leave });
};
export const updateLeave = async (req, res) => {
  const leave = await Leave.findOneAndUpdate({ _id: req.params.id, status: 'Pending' }, { status: req.body.status }, { runValidators: true });
  if (!leave) return res.status(409).json({ success: false, error: 'Leave does not exist or has already been decided' });
  res.json({ success: true, message: 'Leave updated successfully' });
};
