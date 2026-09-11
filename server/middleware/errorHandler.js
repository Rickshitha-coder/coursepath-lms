// Centralized error handler (Task 14). Anything thrown or passed to
// next(err) anywhere in the app lands here instead of crashing the process
// or leaking a stack trace to the client.
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation error.' });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
