import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
import { validateConfig } from './lib/config.js';
validateConfig(process.env);
await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 10000 });
await Promise.all(Object.values(mongoose.models).map(model => model.init()));
const server = app.listen(Number(process.env.PORT || 5000), '0.0.0.0', () => console.log('HR API listening'));
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  app.locals.stopping = true;
  const deadline = setTimeout(() => process.exit(1), 25000).unref();
  server.close(async () => { await mongoose.disconnect(); clearTimeout(deadline); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
