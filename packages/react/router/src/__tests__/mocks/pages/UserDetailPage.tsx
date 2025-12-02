import type { LoaderFunctionArgs, ErrorElementProps } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
  return { userId: params.id, loaded: true };
}

export function ErrorElement({ error, fusion }: ErrorElementProps) {
  return <div>Error: {error?.message}</div>;
}

export default function UserDetailPage() {
  return <div>User Detail Page</div>;
}
