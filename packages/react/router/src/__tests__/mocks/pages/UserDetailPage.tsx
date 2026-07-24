import type { LoaderFunctionArgs, ErrorElementProps } from '@equinor/fusion-framework-react-router';
import type { ShouldRevalidateFunctionArgs } from 'react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
  return { userId: params.id, loaded: true };
}

export function ErrorElement({ error, fusion }: ErrorElementProps) {
  return <div>Error: {error?.message}</div>;
}

export function HydrateFallback() {
  return <div>Loading user details...</div>;
}

export function shouldRevalidate({ currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname;
}

export default function UserDetailPage() {
  return <div>User Detail Page</div>;
}
