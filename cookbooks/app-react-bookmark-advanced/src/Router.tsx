import { RouterProvider } from 'react-router-dom';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { Router as RemixRouter } from '@remix-run/router';

import routes from './Routes';

export default function () {
    const module = useAppModule<NavigationModule>('navigation');
    const router: RemixRouter = module.createRouter(routes);
    return <RouterProvider router={router} fallbackElement={<p>:(</p>} />;
}
