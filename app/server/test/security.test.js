import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Salary from '../models/Salary.js';
import Leave from '../models/Leave.js';
import Department from '../models/Department.js';
import { calculateSalary, toMinorUnits } from '../lib/money.js';
import { validateConfig } from '../lib/config.js';

process.env.NODE_ENV = 'test';
process.env.APP_ORIGIN = 'http://localhost:8080';
process.env.JWT_KEY = 'test-only-key-012345678901234567890123456789';
const { app, metrics } = await import('../app.js');
after(() => metrics.clear());
const ownId = '000000000000000000000001';
const foreignId = '000000000000000000000002';
const employeeId = '000000000000000000000003';
const departmentId = '000000000000000000000004';
const actor = (role = 'employee') => ({ _id: ownId, role, name: 'Test', active: true, tokenVersion: 0 });
const token = (version = 0) => jwt.sign({ _id: ownId, version }, process.env.JWT_KEY, { issuer: 'hr-api', audience: 'hr-app', expiresIn: '1h' });
const authenticated = (t, role = 'employee') => {
  t.mock.method(User, 'findById', async () => actor(role));
  return 'Bearer ' + token();
};
test('missing and malformed authorization return 401', async () => {
  await request(app).get('/api/employee').expect(401);
  await request(app).get('/api/employee').set('Authorization', 'Bearer invalid').expect(401);
});
test('revoked and disabled sessions are rejected', async t => {
  t.mock.method(User, 'findById', async () => ({ ...actor(), tokenVersion: 1 }));
  await request(app).get('/api/auth/verify').set('Authorization', 'Bearer ' + token()).expect(401);
  User.findById.mock.mockImplementation(async () => ({ ...actor(), active: false }));
  await request(app).get('/api/auth/verify').set('Authorization', 'Bearer ' + token()).expect(401);
});
test('employee cannot call any administrator mutation or directory endpoint', async t => {
  const auth = authenticated(t);
  for (const [method, path] of [
    ['get', '/api/employee'], ['post', '/api/employee/add'], ['put', '/api/employee/' + foreignId],
    ['post', '/api/department/add'], ['delete', '/api/department/' + departmentId],
    ['post', '/api/salary/add'], ['put', '/api/leave/' + foreignId],
    ['get', '/api/leave'], ['get', '/api/dashboard/summary'], ['post', '/api/attendance'],
  ]) await request(app)[method](path).set('Authorization', auth).send({ role: 'admin', status: 'Approved' }).expect(403);
});
test('another employee profile, salary and leave records are forbidden', async t => {
  const auth = authenticated(t);
  t.mock.method(Employee, 'findOne', async () => ({ _id: employeeId, userID: foreignId }));
  for (const path of ['/api/employee/', '/api/salary/', '/api/leave/']) await request(app).get(path + employeeId).set('Authorization', auth).expect(403);
});
test('employee can read own salary using their user ID', async t => {
  const auth = authenticated(t);
  t.mock.method(Employee, 'findOne', async () => ({ _id: employeeId, userID: ownId }));
  t.mock.method(Salary, 'find', filter => {
    assert.equal(String(filter.employeeId), employeeId);
    return { sort: () => ({ populate: async () => [{ netSalary: 1051 }] }) };
  });
  const result = await request(app).get('/api/salary/' + ownId).set('Authorization', auth).expect(200);
  assert.equal(result.body.salary[0].netSalary, 1051);
});
test('leave creation ignores a forged userId and uses session identity', async t => {
  const auth = authenticated(t);
  t.mock.method(Employee, 'findOne', async filter => {
    assert.equal(String(filter.userID), ownId);
    return { _id: employeeId };
  });
  t.mock.method(Leave, 'create', async value => {
    assert.equal(value.employeeId, employeeId);
    assert.equal(value.userId, undefined);
    assert.equal(value.status, undefined);
  });
  await request(app).post('/api/leave/add').set('Authorization', auth).send({
    userId: foreignId, status: 'Approved', leaveType: 'Annual Leave', startDate: '2026-11-18', endDate: '2026-11-19', reason: 'Test',
  }).expect(201);
});
test('invalid IDs, date ranges, status, and money are rejected before writes', async t => {
  const auth = authenticated(t, 'admin');
  await request(app).get('/api/employee/invalid').set('Authorization', auth).expect(400);
  await request(app).post('/api/leave/add').set('Authorization', auth).send({ leaveType: 'Annual Leave', startDate: '2026-11-20', endDate: '2026-11-18', reason: 'Test' }).expect(400);
  await request(app).put('/api/leave/' + employeeId).set('Authorization', auth).send({ status: 'arbitrary' }).expect(400);
  await request(app).post('/api/salary/add').set('Authorization', auth).send({ employeeId, basicSalary: '-1', payDate: '2026-11-18' }).expect(400);
  await request(app).get('/api/attendance?date=2026-02-30').set('Authorization', auth).expect(400);
});
test('password change cannot target another user and revokes current sessions', async t => {
  const auth = authenticated(t);
  const hash = await bcrypt.hash('old-password-value', 4);
  let saved = false;
  User.findById.mock.mockImplementation(id => {
    assert.equal(String(id), ownId);
    return { ...actor(), select: async () => ({ ...actor(), password: hash, save: async function() { assert.equal(this.tokenVersion, 1); saved = true; } }) };
  });
  const result = await request(app).put('/api/setting/change-password').set('Authorization', auth).send({ userId: foreignId, oldPassword: 'old-password-value', newPassword: 'new-password-value' }).expect(200);
  assert.ok(saved);
  assert.match(result.headers['set-cookie'][0], /Expires=Thu, 01 Jan 1970/);
});
test('login validates string email and returns uniform credential failures', async t => {
  await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: 'anything' }).expect(400);
  t.mock.method(User, 'findOne', () => ({ select: async () => null }));
  const result = await request(app).post('/api/auth/login').send({ email: 'nobody@example.test', password: 'anything' }).expect(401);
  assert.equal(result.body.error, 'Invalid email or password');
});
test('login sets HttpOnly SameSite session without a browser-readable token', async t => {
  const password = 'secure-password-value';
  const hash = await bcrypt.hash(password, 4);
  t.mock.method(User, 'findOne', () => ({ select: async () => ({ ...actor('admin'), password: hash }) }));
  const result = await request(app).post('/api/auth/login').send({ email: 'admin@example.test', password }).expect(200);
  assert.equal(result.body.token, undefined);
  assert.match(result.headers['set-cookie'][0], /HttpOnly/);
  assert.match(result.headers['set-cookie'][0], /SameSite=Strict/);
  assert.equal(result.body.user.password, undefined);
});
test('cross-site writes are rejected', async () => {
  await request(app).post('/api/auth/login').set('Origin', 'https://attacker.example').send({}).expect(403);
});
test('upload rejects executable files and oversized images', async t => {
  const auth = authenticated(t, 'admin');
  await request(app).post('/api/employee/add').set('Authorization', auth).attach('image', Buffer.from('<script>alert(1)</script>'), 'payload.html').expect(400);
  await request(app).post('/api/employee/add').set('Authorization', auth).attach('image', Buffer.alloc(2 * 1024 * 1024 + 1), 'large.jpg').expect(400);
});
test('department deletion archives without deleting employees or salary', async t => {
  const auth = authenticated(t, 'admin');
  t.mock.method(Department, 'findByIdAndUpdate', async (id, update) => { assert.equal(id, departmentId); assert.deepEqual(update, { archived: true }); return { _id: id }; });
  t.mock.method(Employee, 'deleteMany', () => assert.fail('Employee history must remain'));
  t.mock.method(Salary, 'deleteMany', () => assert.fail('Payroll history must remain'));
  await request(app).delete('/api/department/' + departmentId).set('Authorization', auth).expect(200);
});
test('salary arithmetic preserves decimal amounts and rejects invalid inputs', () => {
  assert.equal(calculateSalary('1000.75', '100.50', '50.25'), 1051);
  assert.equal(calculateSalary('0.10', '0.20'), 0.3);
  assert.equal(toMinorUnits('0.01'), 1);
  for (const value of ['-1', '1.999', 'NaN', 'Infinity', '1e5', {}, '']) assert.throws(() => toMinorUnits(value));
  assert.throws(() => calculateSalary('1', '0', '2'));
});
test('production refuses weak secrets, HTTP origins and missing durable uploads', () => {
  assert.throws(() => validateConfig({ MONGODB_URL: 'mongodb://localhost/db', JWT_KEY: 'weak' }));
  assert.throws(() => validateConfig({ MONGODB_URL: 'mongodb://localhost/db', JWT_KEY: process.env.JWT_KEY, NODE_ENV: 'production', APP_ORIGIN: 'http://localhost' }));
  assert.throws(() => validateConfig({ MONGODB_URL: 'mongodb://localhost/db', JWT_KEY: process.env.JWT_KEY, NODE_ENV: 'production', APP_ORIGIN: 'https://hr.example.test' }));
});
test('health and metrics endpoints work without exposing database credentials', async () => {
  await request(app).get('/health/live').expect(200);
  await request(app).get('/health/ready').expect(503);
  const result = await request(app).get('/metrics').expect(200);
  assert.match(result.text, /hr_http_requests_total/);
  assert.doesNotMatch(result.text, /JWT_KEY|MONGODB_URL/);
});

test('original demo credentials cannot authenticate even before migration', async t => {
  const hash = await bcrypt.hash('admin', 4);
  t.mock.method(User, 'findOne', () => ({ select: async () => ({ ...actor('admin'), password: hash }) }));
  const result = await request(app).post('/api/auth/login').send({ email: 'admin@gmail.com', password: 'admin' }).expect(401);
  assert.equal(result.body.token, undefined);
  assert.equal(result.headers['set-cookie'], undefined);
});
