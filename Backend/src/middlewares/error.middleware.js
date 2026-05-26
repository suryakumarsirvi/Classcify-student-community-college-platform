import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { NODE_ENV } from '../config/env.config.js';

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors
  };

  if (NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  logger.error(error.message, error);

  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;
