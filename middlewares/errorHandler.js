// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format'
    });
  }

  return res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};

// middlewares/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);