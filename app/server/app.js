import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { Registry, collectDefaultMetrics, Histogram, Counter } from 'prom-client';
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import settingRouter from './routes/setting.js';
import dashboardRouter from './routes/dashboard.js';
import { serveUpload } from './lib/uploads.js';
import verifyUser from './middleware/authMiddleware.js';
import { randomUUID } from 'node:crypto';
export const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
app.use(helmet());
app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if (req.get('sec-fetch-site') === 'cross-site' || (origin && origin !== (process.env.APP_ORIGIN || 'http://localhost:8080'))) {
      return res.status(403).json({ success: false, error: 'Cross-origin request rejected' });
    }
  }
  next();
});
app.use(express.json({ limit: '128kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  const requestId = randomUUID();
  res.set('X-Request-ID', requestId);
  res.on('finish', () => {
    if (req.user && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      console.info(JSON.stringify({ event: 'hr_mutation', requestId, actor: String(req.user._id), method: req.method, path: req.originalUrl.split('?')[0], status: res.statusCode }));
    }
  });
  next();
});
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
export const metrics = new Registry();
collectDefaultMetrics({ register: metrics });
const requests = new Counter({ name: 'hr_http_requests_total', help: 'Completed HTTP requests', labelNames: ['method', 'status'], registers: [metrics] });
const latency = new Histogram({ name: 'hr_http_request_duration_seconds', help: 'Request latency', labelNames: ['method'], registers: [metrics] });
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  const stop = latency.startTimer({ method: req.method });
  res.on('finish', () => { stop(); requests.inc({ method: req.method, status: String(res.statusCode) }); });
  next();
});
app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));
app.get('/health/ready', (_req, res) => res.status(mongoose.connection.readyState === 1 && !app.locals.stopping ? 200 : 503).json({ ready: mongoose.connection.readyState === 1 && !app.locals.stopping }));
app.get('/metrics', async (_req, res) => res.type(metrics.contentType).send(await metrics.metrics()));
app.use('/api', rateLimit({ windowMs: 60000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 900000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' } }));
app.use('/api/auth', authRouter);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/setting', settingRouter);
app.use('/api/dashboard', dashboardRouter);
app.get('/api/uploads/:filename', verifyUser, serveUpload);
app.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));
app.use((error, _req, res, _next) => {
  const status = error.code === 11000 ? 409 : error.name === 'ValidationError' || error.name === 'CastError' || error.name === 'MulterError' ? 400 : error.status || 500;
  if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', name: error.name }));
  res.status(status).json({ success: false, error: status === 409 ? 'Record already exists' : status >= 500 ? 'Internal server error' : error.message });
});
