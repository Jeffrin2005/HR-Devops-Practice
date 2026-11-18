import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { date as dateSchema } from '../lib/validation.js';
function day(value) {
  const raw = value || new Date().toISOString().slice(0, 10);
  if (!dateSchema.safeParse(raw).success) throw Object.assign(new Error('Invalid date; use YYYY-MM-DD'), { status: 400 });
  return new Date(raw + 'T00:00:00.000Z');
}
const populate = { path: 'employee', populate: [{ path: 'userID', select: 'name profileImage' }, { path: 'department', select: 'dep_name' }] };
export const markAttendance = async (req, res) => {
  const { employeeId, status, date } = req.body;
  if (!await Employee.exists({ _id: employeeId })) return res.status(404).json({ success: false, error: 'Employee not found' });
  const attendance = await Attendance.findOneAndUpdate({ employee: employeeId, date: day(date) }, { status }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }).populate(populate);
  res.json({ success: true, attendance });
};
export const getAttendanceByDate = async (req, res) => res.json({ success: true, records: await Attendance.find({ date: day(req.query.date) }).populate(populate) });
export const getEmployeeAttendance = async (req, res) => res.json({ success: true, records: await Attendance.find({ employee: req.params.id }).sort({ date: -1 }) });
export const getAttendanceSummary = async (req, res) => {
  const startDate = day(req.query.start);
  const endDate = day(req.query.end);
  if (endDate < startDate) return res.status(400).json({ success: false, error: 'End date must not precede start date' });
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const summary = await Attendance.aggregate([{ $match: { date: { $gte: startDate, $lt: endDate } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({ success: true, summary });
};
