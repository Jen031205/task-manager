'use strict';

require('dotenv').config();
const { app } = require('./app');
const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;

async function seedDefaultUser() {
  try {
    const email = 'tester@example.test';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('local-test-password', salt);

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      await db.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
        uuidv4(),
        email,
        hash,
      ]);
    } else {
      await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
    }
    console.log('Default test user ready: tester@example.test / local-test-password');
  } catch (err) {
    console.warn('Could not seed default user (will continue):', err.message);
  }
}

async function start() {
  try {
    db.initDb();
    console.log('Database initialized.');

    await seedDefaultUser();

    app.listen(PORT, () => {
      console.log(`Task Manager API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

