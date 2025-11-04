import { RouterProvider } from 'react-router-dom';
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';

import routes from './routes';

export default function () {
  // biome-ignore lint/suspicious/noExplicitAny: should be any
  const router = useRouter(routes as any);
  // biome-ignore lint/suspicious/noExplicitAny: should be any
  return <RouterProvider router={router as any} />;
}
