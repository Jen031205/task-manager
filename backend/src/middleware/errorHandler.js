'use strict';

// Safe error handler middleware
function errorHandler(err, req, res, next) {
  const status = err.status || (err instanceof TypeError ? 400 : 500);
  const message = err.message || 'An unexpected error occurred.';

  // Never expose raw stack traces in responses
  res.status(status).json({
    error: message,
  });
}

module.exports = { errorHandler };

