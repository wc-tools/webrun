/**
 * Retry helper utilities
 */

/**
 * Retry helper function that wraps any async function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    timeout: number;
    waitBetweenRetries: () => Promise<void>;
    errorMessage: string;
  }
): Promise<T> {
  const { timeout, waitBetweenRetries, errorMessage } = options;
  const startTime = Date.now();
  let lastError: Error | undefined;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if timeout exceeded
      if (Date.now() - startTime >= timeout) {
        throw new Error(`Timeout ${timeout}ms exceeded ${errorMessage}. ${lastError.message}`);
      }

      // Wait before next retry
      await waitBetweenRetries();
    }
  }
}
