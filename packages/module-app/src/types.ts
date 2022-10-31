import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type AppType = 'standalone' | 'report' | 'launcher';

export type AppAuth = {
    clientId: string;
    resources: string[];
};

type AppCategory = {
    id?: string;
    name: string | null;
    color: string | null;
    defaultIcon: string | null;
};

export type AppManifest = {
    key: string;
    name: string;
    shortName: string;
    version: string;
    description: string;
    type: AppType;
    tags: string[];
    // context?: ContextManifest;
    auth?: AppAuth[];
    icon?: string;
    order: number | null;
    publishedDate: Date | null;
    accentColor: string | null;
    categoryId: string | null;
    category: AppCategory | null;
    hide?: boolean;
};

export type Endpoint = { name: string; uri: string; scopes?: string[] };

export type AppConfig<TEnvironment = unknown> = {
    environment: TEnvironment;
    endpoints: Record<string, string | Endpoint>;
};
