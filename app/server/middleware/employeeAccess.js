import Employee from '../models/Employee.js';
export default async function employeeAccess(req, res, next) {
  const id = req.params.id;
  const employee = await Employee.findOne({ $or: [{ _id: id }, { userID: id }] });
  if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
  if (req.user.role !== 'admin' && String(employee.userID) !== String(req.user._id)) return res.status(403).json({ success: false, error: 'Forbidden' });
  req.employee = employee;
  next();
}
