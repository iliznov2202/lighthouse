import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdir, chmod, rm, open } from 'node:fs/promises';
import { resolve } from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const url = new URL(process.env.DATABASE_URL);
if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('PostgreSQL required');
const directory = resolve(process.env.BACKUP_DIR ?? 'backups');
await mkdir(directory, { recursive: true, mode: 0o700 });
const output = resolve(directory, `mayak-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`);
// Create exclusively with restricted permissions before pg_dump opens the file.
const file = await open(output, 'wx', 0o600);
await file.close();
const pgEnv = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), ...(url.searchParams.has('sslmode') ? { PGSSLMODE: url.searchParams.get('sslmode') } : {}) };
const command = process.env.PG_DUMP_PATH || 'pg_dump';
try {
  await new Promise((resolveDone, reject) => {
    const child = spawn(command, ['--format=custom', '--no-owner', '--no-acl', '--file', output], { env: pgEnv, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    // Avoid printing connection details or database content on errors.
    child.stderr.resume();
    child.once('error', () => reject(new Error('Cannot run pg_dump; check PG_DUMP_PATH')));
    child.once('exit', code => code === 0 ? resolveDone() : reject(new Error('pg_dump failed; check credentials, connectivity and binary version')));
  });
  await chmod(output, 0o600);
  console.log(`Backup created: ${output}`);
} catch (error) {
  await rm(output, { force: true });
  console.error(error.message);
  process.exitCode = 1;
}
