'use strict';

const request = require('supertest');
const { app } = require('../../src/app');
const { createTestUserAndGetToken, createTask, resetTestDb } = require('../helpers/testDb');

describe('task API security', () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  test('rejects task creation without authentication', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Plan tests' });

    expect(response.status).toBe(401);
  });

  test('rejects an empty title', async () => {
    const token = await createTestUserAndGetToken();
    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: ' ' });

    expect(response.status).toBe(400);
  });

  test('does not let one user read another user task', async () => {
    const owner = await createTestUserAndGetToken();
    const stranger = await createTestUserAndGetToken();
    const taskId = await createTask(owner, 'Private task');

    const response = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${stranger}`);

    expect([403, 404]).toContain(response.status);
  });

  // Practice exercise: Add API tests for an invalid task ID, a missing title, and a user attempting to update another user's task.
  test('rejects task creation with missing title', async () => {
    const token = await createTestUserAndGetToken();
    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test('returns 404 for an invalid or non-existent task ID', async () => {
    const token = await createTestUserAndGetToken();
    const response = await request(app)
      .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test('does not let a user update another user task', async () => {
    const owner = await createTestUserAndGetToken();
    const stranger = await createTestUserAndGetToken();
    const taskId = await createTask(owner, 'Owner original task');

    const response = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${stranger}`)
      .send({ title: 'Hacked task' });

    expect([403, 404]).toContain(response.status);
  });

  // Practice exercise (Section 9): Try to update a task with an ownerId field. Verify that the API ignores or rejects it and retains server-derived ownership.
  test('ignores or prevents client-supplied ownerId and retains server-derived ownership', async () => {
    const owner = await createTestUserAndGetToken();
    const stranger = await createTestUserAndGetToken();
    const taskId = await createTask(owner, 'Original Task');

    const response = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${owner}`)
      .send({
        title: 'Updated Title',
        ownerId: 'attacker-id-attempt',
        userId: 'attacker-id-attempt'
      });

    expect(response.status).toBe(200);

    // Verify stranger still cannot access it
    const strangerCheck = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${stranger}`);
    expect([403, 404]).toContain(strangerCheck.status);

    // Verify owner still can access it
    const ownerCheck = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${owner}`);
    expect(ownerCheck.status).toBe(200);
    expect(ownerCheck.body.title).toBe('Updated Title');
  });

  // Section 9: Security negative test - SQL injection payload treated as ordinary string
  test('treats SQL injection strings as ordinary text input safely', async () => {
    const token = await createTestUserAndGetToken();
    const injectionString = "' OR '1'='1";

    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: injectionString });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(injectionString);
  });

  // Section 9: Security negative test - Markup / XSS string treated as plain text
  test('treats markup script tags as plain text safely without executing', async () => {
    const token = await createTestUserAndGetToken();
    const markupString = '<script>alert(1)</script>';

    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: markupString });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(markupString);
  });

  test('successfully performs complete task lifecycle (CRUD)', async () => {
    const token = await createTestUserAndGetToken();

    // 1. Create
    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Complete testing guide' });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body.id;

    // 2. List
    const listRes = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].id).toBe(taskId);

    // 3. Update
    const updateRes = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Complete testing guide updated', isCompleted: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.isCompleted).toBe(true);

    // 4. Delete
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);

    // 5. Verify deleted
    const getRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});

