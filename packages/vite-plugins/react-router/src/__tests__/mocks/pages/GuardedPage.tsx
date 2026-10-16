/**
 * Provides a guard fixture for route-module middleware transformation tests.
 *
 * @returns Nothing, so the router continues the middleware chain.
 */
function guard(): void {}

export const middleware = [guard];

export const handle = {};

/**
 * Provides a loader fixture guarded by the route middleware.
 *
 * @returns Loaded fixture data.
 */
export async function clientLoader(): Promise<{ loaded: boolean }> {
  return { loaded: true };
}

/**
 * Provides an action fixture guarded by the route middleware.
 *
 * @returns Submitted fixture data.
 */
export async function action(): Promise<{ saved: boolean }> {
  return { saved: true };
}

/**
 * Provides a default export fixture for route-module middleware transformation tests.
 *
 * @returns No rendered output.
 */
export default function GuardedPage(): null {
  return null;
}
