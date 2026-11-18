import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Salary from '../models/Salary.js';
import Attendance from '../models/Attendance.js';
import { validateConfig } from '../lib/config.js';
validateConfig(process.env);
try {
  await mongoose.connect(process.env.MONGODB_URL);
  // Stop for manual reconciliation; never delete duplicate accounts automatically.
  const duplicates = await User.aggregate([{ $group: { _id: { $toLower: { $trim: { input: '$email' } } }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]);
  if (duplicates.length) throw new Error('Duplicate email addresses found. Reconcile accounts before migration.');
  for await (const user of User.collection.find({})) {
    await User.updateOne({ _id: user._id }, { $set: { email: user.email.trim().toLowerCase(), active: user.active ?? true, tokenVersion: user.tokenVersion ?? 0 } });
  }
  // Known demo accounts are disabled, preserving employee and payroll history.
  await User.updateMany({ email: { $in: ['admin@gmail.com', 'employee@gmail.com'] } }, { $set: { active: false }, $inc: { tokenVersion: 1 } });
  await User.createIndexes();
  await Employee.createIndexes();
  await Salary.createIndexes();
  await Attendance.createIndexes();
  console.log('Migration completed. Create a new administrator if the old demo account was disabled.');
} finally { await mongoose.disconnect(); }
