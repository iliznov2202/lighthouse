export function validateEnvironment(env: Record<string, unknown>) {
  const nodeEnv = String(env.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV is invalid');
  const production = nodeEnv === 'production';
  const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET'];
  for (const key of required) {
    if (typeof env[key] !== 'string' || !env[key]) throw new Error(`${key} is required`);
  }
  const secret = env.JWT_ACCESS_SECRET as string;
  if (secret.length < 32 || secret.startsWith('replace-')) throw new Error('Set a random JWT_ACCESS_SECRET of at least 32 characters');
  const url = new URL(env.DATABASE_URL as string);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must use PostgreSQL');
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  if (production && !databaseName.endsWith('_prod')) throw new Error('Production database name must end with _prod');
  if (!production && databaseName.endsWith('_prod')) throw new Error('Development/test must not use a production database');
  const origins = String(env.FRONTEND_ORIGINS ?? (production ? '' : 'http://localhost:5173,http://127.0.0.1:5173'));
  if (!origins || origins.split(',').some(origin => {
    try {
      const parsed = new URL(origin.trim());
      return parsed.origin !== origin.trim() || !['https:', 'http:'].includes(parsed.protocol) || (production && (parsed.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)));
    } catch { return true; }
  })) throw new Error('FRONTEND_ORIGINS must contain explicit origins (HTTPS in production)');
  const host = String(env.HOST ?? '127.0.0.1');
  if (!['127.0.0.1', '0.0.0.0'].includes(host)) throw new Error('HOST must be 127.0.0.1 or 0.0.0.0');
  const trustProxy = String(env.TRUST_PROXY ?? 'false');
  if (!['false', 'loopback', '1'].includes(trustProxy)) throw new Error('TRUST_PROXY must be false, loopback or 1');
  if (production && trustProxy === 'false') throw new Error('Production requires a trusted HTTPS reverse proxy');
  const number = (key: string, fallback: number, max: number) => {
    const value = Number(env[key] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`${key} is invalid`);
    return value;
  };
  return { ...env, NODE_ENV: nodeEnv, HOST: host, TRUST_PROXY: trustProxy, PORT: number('PORT', 3000, 65535), ACCESS_TOKEN_TTL_SECONDS: number('ACCESS_TOKEN_TTL_SECONDS', 900, 3600), REFRESH_TOKEN_TTL_DAYS: number('REFRESH_TOKEN_TTL_DAYS', 30, 90), FRONTEND_ORIGINS: origins };
}
