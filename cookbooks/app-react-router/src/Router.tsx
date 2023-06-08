import { RouterProvider } from 'react-router-dom';
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';

import routes from './routes';

export default function () {
    const router = useRouter(routes);
    return <RouterProvider router={router} fallbackElement={<p>:(</p>} />;
}
