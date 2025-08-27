import { useState, useLayoutEffect, useSyncExternalStore } from 'react';
import { BehaviorSubject, scan } from 'rxjs';

import { useAppModule } from '@equinor/fusion-framework-react-app';

import type { SyncEvent, StateWithReplicaModule } from '../../modules/app-state-with-replication';

export const useSyncEvents = (limit: number) => {
  const [event$] = useState(() => new BehaviorSubject<SyncEvent[]>([]));
  const provider = useAppModule<StateWithReplicaModule>('state');

  // Make limit static, only allowed on first call
  const staticLimitRef = useState(limit)[0];

  useLayoutEffect(() => {
    const subscription = provider.syncEvent$
      .pipe(
        scan((acc, value) => {
          acc.push(value);
          return acc.length > staticLimitRef ? acc.slice(staticLimitRef * -1) : acc;
        }, [] as SyncEvent[]),
      )
      .subscribe(event$);
    return () => subscription.unsubscribe();
  }, [provider, staticLimitRef, event$]);

  const events = useSyncExternalStore(
    (onChange) => {
      const subscription = event$.subscribe(onChange);
      return () => subscription.unsubscribe();
    },
    () => event$.getValue(),
    () => event$.getValue(),
  );
  return events;
};

export default useSyncEvents;
