'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

router.get('/', controller.listTasks);
router.post('/', controller.createTask);
router.get('/:id', controller.getTask);
router.put('/:id', controller.updateTask);
router.patch('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;

