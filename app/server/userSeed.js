import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import { email, password } from './lib/validation.js';
import { validateConfig } from './lib/config.js';
validateConfig(process.env);
const adminEmail = email.parse(process.env.ADMIN_EMAIL);
const adminPassword = password.parse(process.env.ADMIN_PASSWORD);
try {
  await mongoose.connect(process.env.MONGODB_URL);
  await User.init();
  if (await User.exists({ role: 'admin', active: true })) throw new Error('Administrator already exists; bootstrap refused');
  await User.create({ name: 'Administrator', email: adminEmail, password: await bcrypt.hash(adminPassword, 12), role: 'admin' });
  console.log('Administrator created. Remove ADMIN_PASSWORD from your environment.');
} finally { await mongoose.disconnect(); }
