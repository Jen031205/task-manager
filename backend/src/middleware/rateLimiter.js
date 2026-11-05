'use strict';

const rateLimit = require('express-rate-limit');

// Rate limiter for auth endpoints (login, register, refresh)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // Generous in development and tests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

// A specific strict rate limiter for rate-limiting tests
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded, please retry after some time.',
  },
});

module.exports = {
  authLimiter,
  strictLimiter,
};

