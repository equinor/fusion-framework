import { filter, scan, tap } from 'rxjs';

import {
    ReliableDictionary,
    EventHub,
    LocalStorageProvider,
    type FeatureLogger,
} from '@equinor/fusion';

import type { ContextCache } from '@equinor/fusion/lib/core/ContextManager';

import { Fusion } from '@equinor/fusion-framework-react';

import { type ContextItem } from '@equinor/fusion-framework-module-context';

export class LegacyContextManager extends ReliableDictionary<ContextCache> {
    #framework: Fusion;

    constructor(args: {
        framework: Fusion;
        // TODO - enable module-navigation
        history: History;
        featureLogger: FeatureLogger;
    }) {
        super(new LocalStorageProvider(`FUSION_CURRENT_CONTEXT`, new EventHub()));

        this.#framework = args.framework;

        const { context } = args.framework.modules;

        context.currentContext$
            .pipe(
                tap((x) => args.featureLogger.setCurrentContext(x?.id ?? null, x?.title ?? null)),
                filter((x): x is ContextItem => !!x),
                scan((acc, value) => {
                    if (!acc.find((x) => x.id === value.id)) {
                        return [value, ...acc].slice(0, 9);
                    }
                    return acc;
                }, [] as Array<ContextItem>)
            )
            .subscribe((values) => {
                const currentContext = values.shift();

                this.setAsync('history', values);

                this.setAsync('current', currentContext ?? null);

                if (currentContext) {
                    args.featureLogger.log('Context selected', '0.0.1', {
                        selectedContext: currentContext,
                        // why do we need and array of all contexts?
                        previusContexts: values.map((c) => ({ id: c.id, name: c.title })),
                    });
                }
            });
    }

    public getCurrentContext(): ContextItem | null | undefined {
        return this.#framework.modules.context.currentContext;
    }

    public async setCurrentContextAsync(context: string | ContextItem | null): Promise<void> {
        const contextProvider = this.#framework.modules.context;
        if (context === null) {
            this.#framework.modules.context.clearCurrentContext();
        } else if (typeof context === 'string') {
            await contextProvider.setCurrentContextByIdAsync(context);
        } else {
            await contextProvider.setCurrentContextAsync(context);
        }
    }

    public async setCurrentContextIdAsync(id: string | null): Promise<void> {
        return this.setCurrentContextAsync(id);
    }

    getLinkedContextAsync() {
        throw Error(
            '🤷 [getLinkedContextAsync] not implemented/supported, context fusion-core if needed'
        );
    }
    getCurrentContextAsync() {
        throw Error(
            '🤷 [getCurrentContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
    getHistory() {
        const value = this.toObject();
        return value?.history || [];
    }
    exchangeContextAsync() {
        throw Error(
            '🤷 [exchangeContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
    exchangeCurrentContextAsync() {
        throw Error(
            '🤷 [exchangeCurrentContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
}

export default LegacyContextManager;
