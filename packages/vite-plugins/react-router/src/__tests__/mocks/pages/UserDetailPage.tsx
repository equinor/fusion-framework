/**
 * Provides a loader fixture for route transformation tests.
 *
 * @returns Loaded fixture data.
 */
export async function clientLoader(): Promise<{ loaded: boolean }> {
  return { loaded: true };
}

/**
 * Provides an error element fixture for route transformation tests.
 *
 * @returns No rendered output.
 */
export function ErrorElement(): null {
  return null;
}

/**
 * Provides a hydration fallback fixture for route transformation tests.
 *
 * @returns No rendered output.
 */
export function HydrateFallback(): null {
  return null;
}

/**
 * Provides a revalidation fixture for route transformation tests.
 *
 * @returns Whether the fixture route should revalidate.
 */
export function shouldRevalidate(): boolean {
  return true;
}

/**
 * Provides a default export fixture for route transformation tests.
 *
 * @returns No rendered output.
 */
export default function UserDetailPage(): null {
  return null;
}
