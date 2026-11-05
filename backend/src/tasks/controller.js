'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { validateTitle } = require('./validation');

async function listTasks(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, title, is_completed AS "isCompleted", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title: rawTitle } = req.body || {};

    // validateTitle trims and verifies string length (1 - 120), throws TypeError on invalid
    const title = validateTitle(rawTitle);

    const taskId = uuidv4();
    // Security check: Ignore any client-sent ownerId/userId and always bind to req.user.id
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO tasks (id, user_id, title, is_completed)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, title, is_completed AS "isCompleted", created_at AS "createdAt"`,
      [taskId, userId, title]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ error: 'Valid task ID is required.' });
    }

    // Broken Object Level Authorization (BOLA) protection:
    // Only query where user_id matches the authenticated user
    const result = await db.query(
      `SELECT id, title, is_completed AS "isCompleted", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM tasks
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      // 404 prevents disclosing whether the task ID exists for another user
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ error: 'Valid task ID is required.' });
    }

    // Check ownership first
    const existing = await db.query(
      `SELECT id FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { title: rawTitle, isCompleted } = req.body || {};

    let title = undefined;
    if (rawTitle !== undefined) {
      title = validateTitle(rawTitle);
    }

    // Safe update: server strictly controls user_id, client-provided ownerId is ignored
    const updates = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(title);
    }

    if (isCompleted !== undefined) {
      updates.push(`is_completed = $${idx++}`);
      values.push(Boolean(isCompleted));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const idIdx = idx++;
    values.push(req.user.id);
    const userIdx = idx++;

    const result = await db.query(
      `UPDATE tasks
       SET ${updates.join(', ')}
       WHERE id = $${idIdx} AND user_id = $${userIdx}
       RETURNING id, title, is_completed AS "isCompleted", updated_at AS "updatedAt"`,
      values
    );

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ error: 'Valid task ID is required.' });
    }

    const result = await db.query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};

