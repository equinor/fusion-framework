import type { Flow } from '@equinor/fusion-observable';
import { type Actions, actions } from './StateProvider.actions';
import type { State } from './StateProvider.store';
import { catchError, concatMap, filter, forkJoin, from, map, merge, mergeMap, of } from 'rxjs';
import type { IStorageAdapter } from './adapters';

const handleStoreItem = (adapters: Array<IStorageAdapter>): Flow<Actions, State> => (action$) => {
  return action$.pipe(
    filter(actions.storeItem.match),
    concatMap((action) => {
      const { item } = action.payload;

      if (adapters.length === 0) {
        return of(actions.storeItem.failure(new Error('no adapters provided')));
      }

      // Wrap each setItem call with catchError to tolerate individual failures
      const jobs = adapters.map((adapter) => {
        return from(adapter.setItem(item.key, item.value)).pipe(
          catchError(err => of(new Error('adapter failed', { cause: err })))
        )
      });

      return forkJoin(jobs).pipe(
        map((results) => {
          const errors = results.filter(result => result instanceof Error);
          if (errors.length === adapters.length) {
            return actions.storeItem.failure(errors);
          }
          return actions.storeItem.success(item, errors);
        })
      );
    })
  );
};

const handleStoreItems = (adapters: Array<IStorageAdapter>): Flow<Actions, State> => (action$) => {
  return action$.pipe(
    filter(actions.storeItems.match),
    concatMap((action) => {
      const { items } = action.payload;

      if (adapters.length === 0) {
        return of(actions.storeItem.failure(new Error('no adapters provided')));
      }

      const jobs = adapters.map((adapter) => {
        const job$ = adapter.setItems
          ? from(adapter.setItems(items))
          : from(items).pipe(
            mergeMap((item) => from(adapter.setItem(item.key, item.value)))
          );

        return job$.pipe(
          catchError(err => of(new Error('adapter failed', { cause: err })))
        );

      });

      return forkJoin(jobs).pipe(
        map((results) => {
          const errors = results.filter(result => result instanceof Error);
          if (errors.length === adapters.length) {
            return actions.storeItems.failure(errors);
          }
          return actions.storeItems.success(items, errors);
        })
      );
    })
  );
};

const handleStoreSuccess: Flow<Actions, State> = (action$) => {
  return merge(
    action$.pipe(
      filter(actions.storeItem.success.match),
      map((action) => {
        const { item } = action.payload;
        return actions.setItems([item]);
      })
    ),
    action$.pipe(
      filter(actions.storeItem.success.match),
      map((action) => {
        const { item } = action.payload;
        return actions.setItems([item]);
      })
    )
  )};

export const flows = (adapters: Array<IStorageAdapter>): Flow<Actions, State> => (action$, state) => {
  return merge(
    handleStoreItem(adapters)(action$, state),
    handleStoreItems(adapters)(action$, state),
    handleStoreSuccess(action$, state),
  );
};
