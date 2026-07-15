export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'No token provided, access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_REFRESH_TOKEN: 'Refresh token expired, please log in again',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_PASSWORD: 'Incorrect password',
  OTP_INVALID: 'Invalid or expired OTP code',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  SERVER_ERROR: 'Internal server error',
} as const;
