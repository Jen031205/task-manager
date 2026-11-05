'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./auth/routes');
const taskRoutes = require('./tasks/routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Bounded body size to prevent unrestricted resource consumption (OWASP)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint for k6 / uptime checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized safe error handler
app.use(errorHandler);

module.exports = { app };

