/**
 * Allowlisted primitive summaries: controlled reason codes, counts and validated static
 * identity. Never pass payloads, URLs, user data, arguments or raw error text.
 */
export type OperationalProperties = Readonly<Record<string, string | number | boolean>>;
