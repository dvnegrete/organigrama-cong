/**
 * Generate a UUID v4 using the native Crypto API
 * Supported in all modern browsers and Node.js 15+
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
