import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Salary from '../models/Salary.js';

test('replica-set integration: rollback, payroll, retention, and token revocation', { skip: !process.env.MONGODB_TEST_URL }, async t => {
  // Deliberately require a dedicated database name before any test cleanup.
  const url = new URL(process.env.MONGODB_TEST_URL);
  assert.equal(url.pathname, '/hr_test', 'Integration tests require a dedicated /hr_test database');
  process.env.NODE_ENV = 'test';
  process.env.JWT_KEY = 'integration-test-key-012345678901234567890';
  process.env.APP_ORIGIN = 'http://localhost:8080';
  await mongoose.connect(process.env.MONGODB_TEST_URL);
  const { app, metrics } = await import('../app.js');
  try {
    await mongoose.connection.dropDatabase();
    await Promise.all([User.init(), Employee.init(), Department.init(), Salary.init()]);
    const password = 'integration-password-value';
    const admin = await User.create({ name: 'Admin', email: 'admin@example.test', password: await bcrypt.hash(password, 4), role: 'admin' });
    const auth = 'Bearer ' + jwt.sign({ _id: admin.id, version: 0 }, process.env.JWT_KEY, { issuer: 'hr-api', audience: 'hr-app', expiresIn: '1h' });
    const department = await Department.create({ dep_name: 'Engineering' });
    const payload = { name: 'Employee', email: 'employee@example.test', employeeID: 'EMP-1', department: department.id, salary: '1000.75', password: 'employee-password-value', role: 'employee' };
    await request(app).post('/api/employee/add').set('Authorization', auth).send(payload).expect(201);
    await t.test('duplicate employee number rolls back the new user', async () => {
      await request(app).post('/api/employee/add').set('Authorization', auth).send({ ...payload, email: 'rollback@example.test' }).expect(409);
      assert.equal(await User.countDocuments({ email: 'rollback@example.test' }), 0);
    });
    const employee = await Employee.findOne({ employeeID: 'EMP-1' });
    await t.test('payroll stores correct decimals', async () => {
      await request(app).post('/api/salary/add').set('Authorization', auth).send({ employeeId: employee.id, basicSalary: '1000.75', allowances: '100.50', deductions: '50.25', payDate: '2026-11-18' }).expect(201);
      assert.equal((await Salary.findOne({ employeeId: employee.id })).netSalary, 1051);
    });
    await t.test('archiving retains employee and payroll history', async () => {
      await request(app).delete('/api/department/' + department.id).set('Authorization', auth).expect(200);
      assert.equal(await Employee.countDocuments({ department: department.id }), 1);
      assert.equal(await Salary.countDocuments({ employeeId: employee.id }), 1);
    });
    await t.test('password change invalidates issued tokens', async () => {
      await request(app).put('/api/setting/change-password').set('Authorization', auth).send({ oldPassword: password, newPassword: 'replacement-password-value' }).expect(200);
      await request(app).get('/api/auth/verify').set('Authorization', auth).expect(401);
    });
  } finally { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); metrics.clear(); }
});
