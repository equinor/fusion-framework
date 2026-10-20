/**
 * Provides a shared guard fixture that layout modules re-export as `middleware`.
 *
 * @returns Nothing, so the router continues the middleware chain.
 */
function sharedGuard(): void {}

export const middleware = [sharedGuard];
