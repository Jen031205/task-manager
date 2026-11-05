'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-for-task-manager-dev-testing-32-bytes';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-for-task-manager-dev-testing-32-bytes';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

async function createRefreshToken(userId, familyId = null) {
  const currentFamilyId = familyId || uuidv4();
  const tokenId = uuidv4();

  const token = jwt.sign(
    { jti: tokenId, sub: userId, familyId: currentFamilyId },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, family_id, revoked, expires_at)
     VALUES ($1, $2, $3, $4, FALSE, $5)`,
    [tokenId, userId, tokenHash, currentFamilyId, expiresAt]
  );

  return token;
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return null;
  }
}

async function rotateRefreshToken(oldToken) {
  let decoded;
  try {
    decoded = jwt.verify(oldToken, REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }

  const tokenHash = hashToken(oldToken);
  const result = await db.query(
    `SELECT * FROM refresh_tokens WHERE id = $1`,
    [decoded.jti]
  );

  if (result.rows.length === 0) {
    const error = new Error('Refresh token not found');
    error.status = 401;
    throw error;
  }

  const tokenRecord = result.rows[0];

  // Token reuse detection!
  if (tokenRecord.revoked) {
    // Invalidate ALL tokens in this family
    await db.query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE family_id = $1`,
      [tokenRecord.family_id]
    );
    const error = new Error('Token reuse detected. All sessions in this chain have been revoked.');
    error.status = 403;
    throw error;
  }

  // Revoke the old token
  await db.query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1`,
    [tokenRecord.id]
  );

  // Issue new pair in the same family
  const newRefreshToken = await createRefreshToken(decoded.sub, tokenRecord.family_id);
  const newAccessToken = generateAccessToken({ id: decoded.sub, email: decoded.email });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async function revokeToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    await db.query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1`,
      [decoded.jti]
    );
    return true;
  } catch (err) {
    return false;
  }
}

async function revokeAllUserTokens(userId) {
  await db.query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`,
    [userId]
  );
  return true;
}

module.exports = {
  generateAccessToken,
  createRefreshToken,
  verifyAccessToken,
  rotateRefreshToken,
  revokeToken,
  revokeAllUserTokens,
};

