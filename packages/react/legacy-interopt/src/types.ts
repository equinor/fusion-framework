import { Fusion } from '@equinor/fusion-framework';
import { AppModule } from '@equinor/fusion-framework-module-app';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';

export type PortalFramework = Fusion<[AppModule, NavigationModule]>;
