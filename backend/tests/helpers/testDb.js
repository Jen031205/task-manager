'use strict';

const db = require('../../src/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateAccessToken } = require('../../src/auth/tokenService');

async function createTestUserAndGetToken(customEmail = null) {
  const userId = uuidv4();
  const email = customEmail || `user-${userId.substring(0, 8)}@example.test`;
  const passwordHash = await bcrypt.hash('test-password-123', 8);

  await db.query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [userId, email, passwordHash]
  );

  const token = generateAccessToken({ id: userId, email });
  return token;
}

async function createTask(token, title) {
  const { verifyAccessToken } = require('../../src/auth/tokenService');
  const payload = verifyAccessToken(token);
  const taskId = uuidv4();

  await db.query(
    'INSERT INTO tasks (id, user_id, title, is_completed) VALUES ($1, $2, $3, FALSE)',
    [taskId, payload.sub, title]
  );

  return taskId;
}

async function resetTestDb() {
  await db.resetDb();
}

module.exports = {
  createTestUserAndGetToken,
  createTask,
  resetTestDb,
};

