import { AnyModule } from '@equinor/fusion-framework-module';

import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { App } from './app/App';
import AppModuleProvider from './AppModuleProvider';

import { AppModulesInstance } from './types';

type AppModulesLoadedEventInit<TModules extends Array<AnyModule> | unknown = unknown> =
    FrameworkEventInit<{
        appKey: string;
        modules: AppModulesInstance<TModules>;
    }>;

export class AppModulesLoadedEvent<
    TModules extends Array<AnyModule> | unknown = unknown
> extends FrameworkEvent<AppModulesLoadedEventInit<TModules>> {
    constructor(
        appKey: string,
        modules: AppModulesInstance<TModules>,
        init?: Omit<AppModulesLoadedEventInit<TModules>, 'detail'>
    ) {
        super('onAppModulesLoaded', { ...init, detail: { appKey, modules } });
    }
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onAppModulesLoaded: AppModulesLoadedEvent;
        onCurrentAppChanged: FrameworkEvent<
            FrameworkEventInit<{ next?: App; previous?: App }, AppModuleProvider>
        >;
    }
}
