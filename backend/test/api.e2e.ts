import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

const base = process.env.API_TEST_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;
if (process.env.NODE_ENV === 'production' || decodeURIComponent(new URL(process.env.DATABASE_URL!).pathname).endsWith('_prod')) throw new Error('Integration tests must not run against production');
async function request(path: string, method = 'GET', body?: unknown, token?: string) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: response.status === 204 ? null : await response.json() as any };
}

test('REST foundation against PostgreSQL: auth, rotation, membership, validation and CORS', async () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const suffix = randomUUID();
  const email = `e2e-${suffix}@mayak.test`;
  const raceEmail = `e2e-race-${suffix}@mayak.test`;
  const password = `Test-${randomUUID()}`;
  let otherSchoolId: string | undefined;
  let createdClassId: string | undefined;
  try {
    const schools = await request('/schools?query=123');
    assert.equal(schools.status, 200);
    const school = schools.body.find((item: any) => item.name === 'Школа №123');
    assert.ok(school, 'Run the seed first');
    assert.deepEqual((await request('/schools?query=no-such-school')).body, []);
    const classes = await request(`/schools/${school.id}/classes`);
    assert.equal(classes.status, 200);
    for (const name of ['8Б', '9А', '9Б', '10А', '10Б']) assert.ok(classes.body.some((item: any) => item.name === name));
    const class9b = classes.body.find((item: any) => item.name === '9Б');
    const class9a = classes.body.find((item: any) => item.name === '9А');
    assert.ok(class9b._count.users >= 3);
    assert.equal((await request('/schools/not-uuid/classes')).status, 400);
    assert.equal((await request(`/schools/${randomUUID()}/classes`)).status, 404);
    assert.equal((await request('/users/me')).status, 401);
    assert.equal((await request('/auth/register', 'POST', { email: 'bad', password: 'x', name: '' })).status, 400);
    assert.equal((await request('/auth/register', 'POST', { email, password, name: 'Тест', role: 'admin' })).status, 400);

    const registered = await request('/auth/register', 'POST', { email: email.toUpperCase(), password, name: ' Тест ' });
    assert.equal(registered.status, 201);
    assert.equal(registered.body.user.email, email);
    assert.equal(registered.body.user.name, 'Тест');
    assert.equal(registered.body.user.schoolId, null);
    assert.equal(registered.body.user.classId, null);
    assert.ok(!('passwordHash' in registered.body.user));
    const token = registered.body.accessToken;
    let refresh = registered.body.refreshToken;
    assert.equal((await request('/auth/register', 'POST', { email, password, name: 'Тест' })).status, 409);
    assert.equal((await request('/auth/login', 'POST', { email, password: 'incorrect-password' })).status, 401);
    assert.equal((await request('/users/me', 'GET', undefined, token)).status, 200);
    const jwt = new JwtService({ secret: process.env.JWT_ACCESS_SECRET });
    const expiredAccess = await jwt.signAsync({ sub: registered.body.user.id, sid: randomUUID(), type: 'access' }, { expiresIn: -1, issuer: 'mayak', audience: 'mayak-api' });
    assert.equal((await request('/users/me', 'GET', undefined, expiredAccess)).status, 401);
    assert.equal((await request('/users/me', 'GET', undefined, 'invalid-token')).status, 401);
    const session = await prisma.session.findFirstOrThrow({ where: { userId: registered.body.user.id } });
    assert.equal(session.refreshTokenHash, createHash('sha256').update(refresh).digest('hex'));
    assert.notEqual(session.refreshTokenHash, refresh);
    const storedUser = await prisma.user.findUniqueOrThrow({ where: { email } });
    assert.ok(storedUser.passwordHash.startsWith('$argon2id$'));
    assert.notEqual(storedUser.passwordHash, password);

    const race = await Promise.all([request('/auth/refresh', 'POST', { refreshToken: refresh }), request('/auth/refresh', 'POST', { refreshToken: refresh })]);
    assert.deepEqual(race.map(result => result.status).sort(), [200, 401]);
    const rotated = race.find(result => result.status === 200)!;
    assert.notEqual(rotated.body.refreshToken, refresh);
    assert.equal((await request('/auth/refresh', 'POST', { refreshToken: refresh })).status, 401);
    refresh = rotated.body.refreshToken;

    assert.equal((await request('/classes', 'POST', { schoolId: school.id, name: '7А' })).status, 401);
    const created = await request('/classes', 'POST', { schoolId: school.id, name: '7Я' }, token);
    assert.equal(created.status, 201);
    createdClassId = created.body.id;
    const createdAudit = await prisma.auditLog.findFirstOrThrow({ where: { actorId: registered.body.user.id, action: 'CLASS_CREATED', resourceId: createdClassId } });
    await assert.rejects(prisma.auditLog.update({ where: { id: createdAudit.id }, data: { action: 'TAMPERED' } }));
    await assert.rejects(prisma.auditLog.delete({ where: { id: createdAudit.id } }));
    assert.equal((await request('/classes', 'POST', { schoolId: school.id, name: '7Я' }, token)).status, 409);
    assert.equal((await request('/classes', 'POST', { schoolId: school.id, name: '12А' }, token)).status, 400);
    assert.equal((await request('/classes', 'POST', { schoolId: randomUUID(), name: '7А' }, token)).status, 404);
    assert.equal((await request(`/classes/${randomUUID()}/join`, 'POST', undefined, token)).status, 404);
    const joined = await request(`/classes/${class9b.id}/join`, 'POST', undefined, token);
    assert.equal(joined.status, 200);
    assert.equal(joined.body.schoolId, school.id);
    assert.equal(joined.body.classId, class9b.id);
    assert.equal((await request(`/classes/${class9b.id}/join`, 'POST', undefined, token)).status, 200);
    assert.equal(await prisma.auditLog.count({ where: { actorId: registered.body.user.id, action: 'CLASS_JOINED' } }), 1);
    assert.equal((await request(`/classes/${class9a.id}/join`, 'POST', undefined, token)).status, 409);
    const raceUser = await request('/auth/register', 'POST', { email: raceEmail, password, name: 'Race' });
    assert.equal(raceUser.status, 201);
    const joins = await Promise.all([request(`/classes/${class9a.id}/join`, 'POST', undefined, raceUser.body.accessToken), request(`/classes/${class9b.id}/join`, 'POST', undefined, raceUser.body.accessToken)]);
    assert.deepEqual(joins.map(result => result.status).sort(), [200, 409]);
    const details = await request(`/classes/${class9b.id}`, 'GET', undefined, token);
    assert.equal(details.status, 200);
    assert.ok(!('users' in details.body));

    const other = await prisma.school.create({ data: { name: `E2E-${suffix}`, city: 'Тест' } });
    otherSchoolId = other.id;
    const otherClass = await prisma.schoolClass.create({ data: { schoolId: other.id, name: '9Б' } });
    assert.equal((await request(`/classes/${otherClass.id}/join`, 'POST', undefined, token)).status, 409);
    assert.equal((await request(`/classes/${otherClass.id}`, 'GET', undefined, token)).status, 403);
    assert.equal((await request('/classes', 'POST', { schoolId: other.id, name: '8Б' }, token)).status, 403);
    await assert.rejects(prisma.user.update({ where: { email }, data: { schoolId: other.id } }), 'Database must reject class/school mismatch');
    await assert.rejects(prisma.user.update({ where: { email }, data: { schoolId: null } }), 'Class requires school');

    const me = await request('/users/me', 'GET', undefined, token);
    assert.equal(me.body.schoolClass.name, '9Б');
    const login = await request('/auth/login', 'POST', { email, password });
    assert.equal(login.status, 200);
    assert.equal((await request('/auth/logout', 'POST', { refreshToken: refresh })).status, 204);
    assert.equal((await request('/auth/logout', 'POST', { refreshToken: refresh })).status, 204);
    assert.equal((await request('/users/me', 'GET', undefined, token)).status, 401);
    assert.equal((await request('/auth/refresh', 'POST', { refreshToken: refresh })).status, 401);
    assert.equal((await request('/users/me', 'GET', undefined, login.body.accessToken)).status, 200);
    await prisma.session.updateMany({ where: { userId: registered.body.user.id }, data: { expiresAt: new Date(0) } });
    assert.equal((await request('/auth/refresh', 'POST', { refreshToken: login.body.refreshToken })).status, 401);
    assert.equal((await request('/users/me', 'GET', undefined, login.body.accessToken)).status, 401);
    const cors = await fetch(`${base}/users/me`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'authorization' } });
    assert.equal(cors.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    const disallowed = await fetch(`${base}/schools`, { headers: { Origin: 'https://untrusted.test' } });
    assert.equal(disallowed.headers.get('access-control-allow-origin'), null);
    assert.equal((await fetch(`${base}/docs`)).status, 200);
    const docs = await (await fetch(`${base}/docs-json`)).json() as any;
    assert.ok(docs.paths['/auth/register']);
    assert.ok(docs.paths['/schools/{schoolId}/classes']);
    const unknown = await request('/not-found');
    assert.equal(unknown.status, 404);
    assert.equal(unknown.body.statusCode, 404);
    assert.ok(unknown.body.timestamp);
  } finally {
    await prisma.user.deleteMany({ where: { email: { in: [email, raceEmail] } } });
    if (createdClassId) await prisma.schoolClass.delete({ where: { id: createdClassId } });
    if (otherSchoolId) {
      await prisma.schoolClass.deleteMany({ where: { schoolId: otherSchoolId } });
      await prisma.school.delete({ where: { id: otherSchoolId } });
    }
    await prisma.$disconnect();
  }
});
