import {
  AppError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "./custom-errors";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    type: string;
    details?: any;
  };
}

/**
 * Result of error formatting with HTTP status code
 */
export interface FormattedError {
  response: ErrorResponse;
  statusCode: number;
}

/**
 * Maps custom error types to HTTP status codes
 */
function getStatusCode(error: unknown): number {
  if (error instanceof ValidationError) {
    return 400;
  }
  if (error instanceof AuthorizationError) {
    return 403;
  }
  if (error instanceof NotFoundError) {
    return 404;
  }
  if (error instanceof DatabaseError) {
    return 500;
  }
  // Default to 500 for unknown errors
  return 500;
}

/**
 * Formats any error into a consistent error response structure
 * Sanitizes error messages to avoid exposing internal details
 *
 * @param error - The error to format
 * @returns Formatted error response with appropriate status code
 */
export function formatErrorResponse(error: unknown): FormattedError {
  const statusCode = getStatusCode(error);

  // Handle custom AppError instances
  if (error instanceof AppError) {
    return {
      response: {
        success: false,
        message: error.message,
        error: {
          type: error.type,
          details: error.metadata,
        },
      },
      statusCode,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      response: {
        success: false,
        message: error.message,
        error: {
          type: "UNKNOWN_ERROR",
        },
      },
      statusCode,
    };
  }

  // Handle non-Error objects
  return {
    response: {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
      error: {
        type: "UNKNOWN_ERROR",
      },
    },
    statusCode: 500,
  };
}
