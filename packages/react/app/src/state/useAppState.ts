import { useCallback } from 'react';
import type { IStateItem, AllowedValue, StateModule } from '@equinor/fusion-framework-module-state';
import useAppModule from '../useAppModule';
import { EMPTY, filter, map } from 'rxjs';
import { useObservableState } from '@equinor/fusion-observable/react';

export const useAppState = <T extends AllowedValue = AllowedValue>(
  key: string,
): {
  state?: IStateItem<T>;
  setState: (value: T) => void;
  error?: unknown;
} => {
  const stateProvider = useAppModule<StateModule>('state');

  console.log(22, stateProvider.items); // @TODO
  const item$ = stateProvider.items$.pipe(
    filter((item) => {
      console.log(11, item);
      return item.value.key === key
    }),
  );

  const { value: state, error } = useObservableState(item$ ?? EMPTY);
  console.log(error);
  console.log(state);

  const setState = useCallback(
    (value: T) => {
      stateProvider.storeItem({
        key,
        value,
      });
    },
    [key, stateProvider.storeItem],
  );

  return {
    // state: state.,
    setState,
  }
};
