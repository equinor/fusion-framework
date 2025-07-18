import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import type { IStorageAdapter } from './adapters';
import type { IStateItem } from './StateItem';
import type { ObservableInput } from 'rxjs';

export type StateModuleConfig = {
  initial: IStateItem[];
  adapters: Array<IStorageAdapter>;
};

export type StateModuleAdapterConfigCallback<T extends IStorageAdapter = IStorageAdapter> = (
  args: ConfigBuilderCallbackArgs,
) => ObservableInput<T>;

export type { AllowedValue } from './StateItem';;
