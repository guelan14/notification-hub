export const ERROR_CODES = {
  // Auth errors
  AUTH_USERNAME_TAKEN: {
    code: 'AUTH_USERNAME_TAKEN',
    message: 'Username already taken',
    status: 409,
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    status: 401,
  },
  AUTH_JWT_SECRET_MISSING: {
    code: 'AUTH_JWT_SECRET_MISSING',
    message: 'Internal server configuration error',
    status: 500,
  },
  AUTH_UNAUTHORIZED: {
    code: 'AUTH_UNAUTHORIZED',
    message: 'Authentication required',
    status: 401,
  },
  AUTH_FORBIDDEN: {
    code: 'AUTH_FORBIDDEN',
    message: 'Forbidden',
    status: 403,
  },

  // Message errors
  MESSAGE_DAILY_LIMIT_REACHED: {
    code: 'MESSAGE_DAILY_LIMIT_REACHED',
    message: 'Daily message limit reached',
    status: 429,
  },
  MESSAGE_USER_NOT_FOUND: {
    code: 'MESSAGE_USER_NOT_FOUND',
    message: 'User not found',
    status: 404,
  },

  // Database errors
  DB_CONNECTION_ERROR: {
    code: 'DB_CONNECTION_ERROR',
    message: 'Database connection error',
    status: 503,
  },

  // Validation errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    status: 400,
  },

  // Generic errors
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    status: 500,
  },
};

export type ErrorCode = keyof typeof ERROR_CODES;
