/**
 * Retry Utility with Exponential Backoff
 * Provides retry logic for operations that may fail temporarily
 */

/**
 * Error classification for retry logic
 */
export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableError";
  }
}

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableError";
  }
}

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback for retry attempts */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  isRetryable: (error: Error) => {
    // By default, retry on RetryableError or network-related errors
    if (error instanceof NonRetryableError) {
      return false;
    }
    if (error instanceof RetryableError) {
      return true;
    }
    // Check for common network error messages
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    );
  },
  onRetry: () => {},
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param operation - The async operation to retry
 * @param options - Retry options
 * @returns Promise that resolves with operation result or rejects after max retries
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await fetchData(),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  let attempt = 0;

  while (attempt <= opts.maxRetries) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!opts.isRetryable(lastError)) {
        throw lastError;
      }

      // Check if we've exhausted retries
      if (attempt >= opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt + 1,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      // Call retry callback
      opts.onRetry(attempt + 1, lastError);

      // Log retry attempt
      console.log(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms. Error: ${lastError.message}`
      );

      await sleep(delay);
      attempt++;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Classify error as retryable or non-retryable based on common patterns
 */
export function classifyError(error: Error): Error {
  const message = error.message.toLowerCase();

  // Non-retryable errors (client errors, validation errors)
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("not found")
  ) {
    return new NonRetryableError(error.message);
  }

  // Retryable errors (network, timeout, server errors)
  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("server error") ||
    message.includes("503") ||
    message.includes("502")
  ) {
    return new RetryableError(error.message);
  }

  // Default to retryable for unknown errors
  return new RetryableError(error.message);
}
