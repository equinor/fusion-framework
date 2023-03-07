import { RouterProvider } from 'react-router-dom';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useAppModule } from '@equinor/fusion-framework-react-app';

import routes from './Routes';
import { useState } from 'react';

export default function () {
    const module = useAppModule<NavigationModule>('navigation');
    const [router] = useState(() => module.createRouter(routes));
    return <RouterProvider router={router} fallbackElement={<p>:(</p>} />;
}
