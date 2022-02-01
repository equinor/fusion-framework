/**
 * - **Popup:**
 *   Use when initiating the process via opening a popup window in the user's browser
 *
 * - **Redirect:**
 *   Use when initiating the login process by redirecting the user's browser to the authorization endpoint.
 *   This function redirects the page, so any code that follows this function will not execute.
 */
export type AuthBehavior = 'popup' | 'redirect';

/**
 * Default behavior for login and acquisition of token
 */
export const defaultBehavior: AuthBehavior = 'redirect';
