/**
 * Execution log shared by the DSL middleware fixtures, so tests can assert ordering across
 * route modules that the Vite plugin imports independently.
 */
export const middlewareLog: string[] = [];
