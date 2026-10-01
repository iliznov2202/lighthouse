import 'dotenv/config';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { Client } from 'pg';

// Restore only into a separate, existing and empty database. Never drop anything.
const target = process.env.RESTORE_DATABASE_URL;
const archive = process.argv[2];
if (!target || !archive) throw new Error('Set RESTORE_DATABASE_URL and pass a .dump file');
const url = new URL(target);
const source = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : undefined;
const identity = uri => `${uri.hostname}:${uri.port || '5432'}${uri.pathname}`;
if (!['postgres:', 'postgresql:'].includes(url.protocol) || (source && identity(url) === identity(source)) || decodeURIComponent(url.pathname).endsWith('_prod')) throw new Error('Restore requires a separate non-production database');
const client = new Client({ connectionString: target });
try {
  await client.connect();
  const { rows } = await client.query("SELECT count(*)::int AS count FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'");
  if (rows[0].count !== 0) throw new Error('Restore target is not empty');
} finally { await client.end(); }
const pgEnv = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), ...(url.searchParams.has('sslmode') ? { PGSSLMODE: url.searchParams.get('sslmode') } : {}) };
await new Promise((resolveDone, reject) => {
  const child = spawn(process.env.PG_RESTORE_PATH || 'pg_restore', ['--exit-on-error', '--single-transaction', '--no-owner', '--no-acl', '--dbname', pgEnv.PGDATABASE, resolve(archive)], { env: pgEnv, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
  child.stderr.resume();
  child.once('error', () => reject(new Error('Cannot run pg_restore; check PG_RESTORE_PATH')));
  child.once('exit', code => code === 0 ? resolveDone() : reject(new Error('pg_restore failed')));
});
console.log('Restore completed into the separate database');
