export function validateConfig(env) {
  if (env.TRUST_PROXY_HOPS && !/^[012]$/.test(env.TRUST_PROXY_HOPS)) throw new Error('TRUST_PROXY_HOPS must match the supported proxy topology (0, 1, or 2)');
  if (!env.MONGODB_URL) throw new Error('MONGODB_URL is required');
  if (!env.JWT_KEY || Buffer.byteLength(env.JWT_KEY) < 32 || /supersecret|change.?me|example/i.test(env.JWT_KEY)) {
    throw new Error('JWT_KEY must be a randomly generated secret of at least 32 bytes');
  }
  if (env.NODE_ENV === 'production' && !env.APP_ORIGIN?.startsWith('https://')) throw new Error('Production APP_ORIGIN must be HTTPS');
  if (env.NODE_ENV === 'production' && (!env.UPLOAD_BUCKET || /replace|example/i.test(env.UPLOAD_BUCKET))) throw new Error('Production UPLOAD_BUCKET must name a private S3 bucket');
  if (env.APP_ORIGIN && new URL(env.APP_ORIGIN).origin !== env.APP_ORIGIN) throw new Error('APP_ORIGIN must contain only scheme, host, and optional port');
}
