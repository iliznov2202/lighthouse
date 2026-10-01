import 'reflect-metadata';
import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { validateEnvironment } from '../src/config/environment';

test('Production config rejects dev database, insecure origins and unsafe proxy settings', () => {
  const config = { DATABASE_URL: 'postgresql://localhost/mayak_prod', JWT_ACCESS_SECRET: 'x'.repeat(64), NODE_ENV: 'production', FRONTEND_ORIGINS: 'https://app.example.com', TRUST_PROXY: '1' };
  assert.equal(validateEnvironment(config).NODE_ENV, 'production');
  assert.throws(() => validateEnvironment({ ...config, DATABASE_URL: 'postgresql://localhost/mayak_dev' }));
  assert.throws(() => validateEnvironment({ ...config, NODE_ENV: 'development' }));
  assert.throws(() => validateEnvironment({ ...config, FRONTEND_ORIGINS: '*' }));
  assert.throws(() => validateEnvironment({ ...config, FRONTEND_ORIGINS: 'http://app.example.com' }));
  assert.throws(() => validateEnvironment({ ...config, FRONTEND_ORIGINS: 'https://localhost' }));
  assert.throws(() => validateEnvironment({ ...config, TRUST_PROXY: 'true' }));
  assert.throws(() => validateEnvironment({ ...config, TRUST_PROXY: 'false' }));
});

test('Headers, JSON limits, multipart rejection, mass assignment and rate limiting', async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  try {
    const response = await fetch(`${base}/schools`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('x-powered-by'), null);
    const post = (body: string, type = 'application/json') => fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': type }, body });
    assert.equal((await post('x'.repeat(32769))).status, 413);
    assert.equal((await post('{')).status, 400);
    assert.equal((await post('--boundary', 'multipart/form-data; boundary=boundary')).status, 415);
    assert.equal((await post('{}', 'text/plain')).status, 415);
    const assignment = await post(JSON.stringify({ email: 'security@mayak.test', password: 'test-password', name: 'Тест', schoolId: 'bad', classId: 'bad', role: 'admin', passwordHash: 'bad' }));
    assert.equal(assignment.status, 400);
    assert.equal(assignment.headers.get('cache-control'), 'no-store');
    const error = await assignment.json() as { message: string[] };
    for (const key of ['schoolId', 'classId', 'role', 'passwordHash']) assert.ok(error.message.some(message => message.includes(key)));
    // 11 attempts, each with a different forged forwarding header, same source IP.
    // Requests are invalid DTOs, so the test does not create users or hash passwords.
    const attempts = [];
    for (let index = 0; index < 11; index++) {
      attempts.push(await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `198.51.100.${index}`, 'X-Forwarded-Proto': 'https' }, body: '{}' }));
    }
    assert.equal(attempts[0].status, 400);
    assert.equal(attempts[10].status, 429);
    assert.ok(Number(attempts[10].headers.get('retry-after')) > 0);
    assert.equal((await attempts[10].json() as { statusCode: number }).statusCode, 429);
    for (let index = 0; index < 120; index++) await fetch(`${base}/schools`);
    assert.equal((await fetch(`${base}/schools`)).status, 429);
  } finally { await app.close(); }
});

@Controller('probe')
class ProbeController {
  @Get()
  get() { return { ok: true }; }
}
@Module({
  controllers: [ProbeController],
  providers: [{ provide: ConfigService, useValue: new ConfigService({ NODE_ENV: 'production', TRUST_PROXY: 'loopback', FRONTEND_ORIGINS: 'https://app.example.com' }) }],
})
class ProductionProbeModule {}

test('Production transport rejects HTTP, accepts trusted proxy HTTPS, hides Swagger and sets HSTS', async () => {
  const app = await NestFactory.create<NestExpressApplication>(ProductionProbeModule, { bodyParser: false, logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  try {
    assert.equal((await fetch(`${base}/probe`)).status, 400);
    assert.equal((await fetch(`${base}/probe`, { method: 'OPTIONS', headers: { Origin: 'https://app.example.com', 'Access-Control-Request-Method': 'GET' } })).status, 400);
    const headers = { 'X-Forwarded-Proto': 'https' };
    const secure = await fetch(`${base}/probe`, { headers });
    assert.equal(secure.status, 200);
    assert.ok(secure.headers.get('strict-transport-security')?.includes('max-age=31536000'));
    assert.equal((await fetch(`${base}/docs`, { headers })).status, 404);
  } finally { await app.close(); }
});
