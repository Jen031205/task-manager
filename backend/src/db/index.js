'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let memDb = null;

function initDb() {
  const isTest = process.env.NODE_ENV === 'test';
  const hasPgUrl = Boolean(process.env.DATABASE_URL);

  if (isTest && !process.env.USE_REAL_DB) {
    // In-memory PostgreSQL engine using pg-mem for isolated tests
    const { newDb } = require('pg-mem');
    memDb = newDb();
    
    // Register custom functions if needed
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    memDb.public.none(schemaSql);

    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();
  } else {
    // Real PostgreSQL connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskmanager',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
}

async function query(text, params) {
  if (!pool) {
    initDb();
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

