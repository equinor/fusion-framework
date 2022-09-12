import { Fusion } from '@equinor/fusion-framework';
import type { ModulesConfigurator, ModulesInstance } from '@equinor/fusion-framework-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { EventModule } from '@equinor/fusion-framework-module-event';
import { HttpModule } from '@equinor/fusion-framework-module-http';
import { MsalModule } from '@equinor/fusion-framework-module-msal';

export interface IAppConfigurator<
    TModules extends Array<AnyModule> = [],
    TRef extends Fusion = Fusion
> extends ModulesConfigurator<AppModules<TModules>, TRef> {}

// TODO
// eslint-disable-next-line @typescript-eslint/ban-types
export type AppManifest = {};

export type AppModules<TModules extends Array<AnyModule> = []> = [
    ...TModules,
    EventModule,
    HttpModule,
    MsalModule
];

export type AppModulesInstance<TModules extends Array<AnyModule> = []> = ModulesInstance<
    AppModules<TModules>
>;

export type AppModuleInitiator<
    TModules extends Array<AnyModule> = [],
    TRef = Fusion,
    TManifest = AppManifest
> = (
    configurator: IAppConfigurator<TModules>,
    args: { fusion: TRef; manifest: TManifest }
) => void | Promise<void>;

export type AppModuleInit<
    TModules extends Array<AnyModule> = [],
    TRef = Fusion,
    TManifest = AppManifest
> = (
    cb: AppModuleInitiator<TModules, TRef, TManifest>
) => (args: { fusion: TRef; manifest: TManifest }) => Promise<AppModulesInstance<TModules>>;
