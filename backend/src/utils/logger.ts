/**
 * @param message Log message.
 * @param meta Optional structured metadata.
 * @returns Nothing.
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.log(message, meta);
    return;
  }

  console.log(message);
}

/**
 * @param message Warning message.
 * @param meta Optional structured metadata.
 * @returns Nothing.
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.warn(message, meta);
    return;
  }

  console.warn(message);
}

/**
 * @param message Error message.
 * @param meta Optional structured metadata.
 * @returns Nothing.
 */
export function logError(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.error(message, meta);
    return;
  }

  console.error(message);
}
