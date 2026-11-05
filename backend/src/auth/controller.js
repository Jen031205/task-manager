'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const tokenService = require('./tokenService');

async function register(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    await db.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [userId, email.toLowerCase().trim(), passwordHash]
    );

    const user = { id: userId, email: email.toLowerCase().trim() };
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(userId);

    return res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const userRecord = result.rows[0];
    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = { id: userRecord.id, email: userRecord.email };
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    return res.status(200).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const newTokens = await tokenService.rotateRefreshToken(refreshToken);
    return res.status(200).json(newTokens);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken && typeof refreshToken === 'string') {
      await tokenService.revokeToken(refreshToken);
    }
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

async function logoutAll(req, res, next) {
  try {
    await tokenService.revokeAllUserTokens(req.user.id);
    return res.status(200).json({ message: 'Logged out from all sessions.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
};

