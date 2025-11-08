/**
 * Base custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly type: string,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error - thrown when input validation fails
 * Maps to HTTP 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", metadata);
  }
}

/**
 * Authorization error - thrown when user lacks permission
 * Maps to HTTP 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, "AUTHORIZATION_ERROR", metadata);
  }
}

/**
 * Not found error - thrown when requested resource doesn't exist
 * Maps to HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, "NOT_FOUND_ERROR", metadata);
  }
}

/**
 * Database error - thrown when database operations fail
 * Maps to HTTP 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, "DATABASE_ERROR", metadata);
  }
}
