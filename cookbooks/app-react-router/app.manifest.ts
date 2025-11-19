import { defineAppManifest } from '@equinor/fusion-framework-cli/app';
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';

import { routes } from './src/routes';

export default defineAppManifest(async () => ({ routes: await toRouteSchema(routes) }));
