'use strict';

const request = require('supertest');
const { app } = require('../../src/app');
const { resetTestDb } = require('../helpers/testDb');

describe('auth API security and token rotation', () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  test('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'tester@example.test', password: 'local-test-password' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('tester@example.test');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('rejects registration with invalid email or short password', async () => {
    const badEmail = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'local-test-password' });
    expect(badEmail.status).toBe(400);

    const shortPass = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'valid@example.test', password: 'short' });
    expect(shortPass.status).toBe(400);
  });

  test('logs in an existing user with correct credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'tester@example.test', password: 'local-test-password' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tester@example.test', password: 'local-test-password' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('rejects login with incorrect password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'tester@example.test', password: 'local-test-password' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tester@example.test', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  test('refreshes token pair using refresh token rotation', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'rotate@example.test', password: 'local-test-password' });

    const initialRefreshToken = regRes.body.refreshToken;

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: initialRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();
    expect(refreshRes.body.refreshToken).not.toBe(initialRefreshToken);
  });

  test('detects token reuse and revokes entire token family', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'reuse@example.test', password: 'local-test-password' });

    const token1 = regRes.body.refreshToken;

    // First rotation succeeds and gives token2
    const rotate1 = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: token1 });
    expect(rotate1.status).toBe(200);
    const token2 = rotate1.body.refreshToken;

    // Attacker tries to reuse token1!
    const reuseAttempt = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: token1 });
    expect(reuseAttempt.status).toBe(403);

    // Because reuse was detected, token2 must now be invalidated as well!
    const token2Check = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: token2 });
    expect(token2Check.status).toBe(403);
  });

  test('logs out and revokes refresh token', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'logout@example.test', password: 'local-test-password' });

    const refreshToken = regRes.body.refreshToken;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    // Refreshing with logged out token fails
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect([401, 403]).toContain(refreshRes.status);
  });

  test('health endpoint returns 200 status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

