import type { Fusion } from '@equinor/fusion-framework';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

export type PortalFramework = Fusion<[AppModule, NavigationModule]>;
