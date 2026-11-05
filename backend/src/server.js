'use strict';

require('dotenv').config();
const { app } = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    db.initDb();
    console.log('Database initialized.');

    app.listen(PORT, () => {
      console.log(`Task Manager API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

