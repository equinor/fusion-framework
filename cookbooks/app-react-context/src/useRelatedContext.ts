import { useMemo } from 'react';

import { combineLatest, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { useFramework } from '@equinor/fusion-framework-react';
import { useObservableInput, useObservableState } from '@equinor/fusion-observable/react';

/**
 * DO NOT COPY
 * will create util functions for related context
 */
export const useRelatedContext = (type?: string[]) => {
    const framework = useFramework();
    const {
        modules: { context, services },
    } = framework;

    const client$ = useObservableInput(
        useMemo(() => services.createContextClient('json$'), [services])
    );
    const context$ = useMemo(() => context.currentContext$, [context]);

    const related$ = useMemo(
        () =>
            combineLatest([context$, client$]).pipe(
                switchMap(([context, client]) => {
                    return context
                        ? client.related('v1', {
                              id: context.id,
                              query: { filter: { type } },
                          })
                        : EMPTY;
                })
            ),
        [context$, client$]
    );

    const { value: relatedContext } = useObservableState(related$);

    return { relatedContext };
};

export default useRelatedContext;
