'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let memDb = null;

function setupMemDb() {
  const { newDb } = require('pg-mem');
  memDb = newDb();
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  memDb.public.none(schemaSql);
  const adapter = memDb.adapters.createPg();
  pool = new adapter.Pool();
  console.log('Self-contained in-memory PostgreSQL engine ready.');
}

async function initDb() {
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest && !process.env.USE_REAL_DB) {
    setupMemDb();
    return;
  }

  try {
    const candidatePool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/taskmanager',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 1500,
    });
    await candidatePool.query('SELECT 1');
    pool = candidatePool;
    console.log('Connected to PostgreSQL successfully.');
  } catch (err) {
    console.warn(`PostgreSQL unavailable (${err.message}). Using self-contained in-memory database.`);
    setupMemDb();
  }
}

async function query(text, params) {
  if (!pool) {
    await initDb();
  }
  return pool.query(text, params);
}

async function resetDb() {
  if (memDb) {
    memDb.public.none('DELETE FROM tasks; DELETE FROM refresh_tokens; DELETE FROM users;');
  } else if (pool) {
    await pool.query('TRUNCATE TABLE tasks, refresh_tokens, users CASCADE;');
  }
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    memDb = null;
  }
}

module.exports = {
  query,
  resetDb,
  closeDb,
  initDb,
};
