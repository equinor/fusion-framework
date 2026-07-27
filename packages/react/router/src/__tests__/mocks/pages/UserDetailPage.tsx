import type { LoaderFunctionArgs, ErrorElementProps } from '@equinor/fusion-framework-react-router';
import type { ShouldRevalidateFunctionArgs } from 'react-router';

/**
 * Mock client loader used in router tests.
 *
 * @param args - The loader args
 * @returns The loaded user data
 */
export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
  return { userId: params.id, loaded: true };
}

/**
 * Mock error element used in router tests.
 *
 * @param props - The error element's props
 * @returns The error element
 */
export function ErrorElement({ error, fusion }: ErrorElementProps) {
  return <div>Error: {error?.message}</div>;
}

/**
 * Mock hydrate fallback used in router tests.
 *
 * @returns The hydrate fallback
 */
export function HydrateFallback() {
  return <div>Loading user details...</div>;
}

/**
 * Mock should-revalidate function used in router tests.
 *
 * @param args - The revalidation args
 * @returns Whether the route should revalidate
 */
export function shouldRevalidate({ currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname;
}

/**
 * Mock user details page used in router tests.
 *
 * @returns The user detail page
 */
export default function UserDetailPage() {
  return <div>User Detail Page</div>;
}
