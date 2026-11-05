'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);

module.exports = router;

