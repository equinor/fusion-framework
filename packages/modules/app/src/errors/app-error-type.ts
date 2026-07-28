/**
 * Discriminant for application-related errors.
 *
 * - `'not_found'` – The requested resource does not exist (HTTP 404).
 * - `'unauthorized'` – The request lacks valid credentials (HTTP 401).
 * - `'deleted'` – The resource has been removed (HTTP 410).
 * - `'unknown'` – An unexpected failure occurred.
 */
export type AppErrorType = 'not_found' | 'unauthorized' | 'unknown' | 'deleted';
