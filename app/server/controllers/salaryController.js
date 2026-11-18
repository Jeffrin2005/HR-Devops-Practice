import Salary from '../models/Salary.js';
import Employee from '../models/Employee.js';
import { calculateSalary } from '../lib/money.js';
export const addSalary = async (req, res) => {
  if (!await Employee.exists({ _id: req.body.employeeId })) return res.status(404).json({ success: false, error: 'Employee not found' });
  const { basicSalary, allowances = '0', deductions = '0' } = req.body;
  await Salary.create({ ...req.body, allowances, deductions, netSalary: calculateSalary(basicSalary, allowances, deductions) });
  res.status(201).json({ success: true, message: 'Salary added successfully' });
};
export const getSalary = async (req, res) => {
  const salary = await Salary.find({ employeeId: req.employee._id }).sort({ payDate: -1 }).populate('employeeId', 'employeeID');
  res.json({ success: true, salary });
};
