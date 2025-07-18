import type { IAppConfigurator } from '@equinor/fusion-framework-app';

import {
  enableState,
  type StateModuleBuilderCallback,
} from '@equinor/fusion-framework-module-state';
import { createStorage } from '@equinor/fusion-framework-module-state/adapters';

export type AppStateModuleBuilderCallback = (namespace: string, args: Parameters<StateModuleBuilderCallback>[0]) => void | Promise<void>;

export function enableAppState(configurator: IAppConfigurator, cb?: AppStateModuleBuilderCallback): void {
  const { appKey } = configurator.manifest;
  const storageKey = `App::${appKey}`;

  const callback: StateModuleBuilderCallback = async (args) => {
    if (!cb) {
      args.addAdapter(async () => {
        return createStorage(storageKey, 'local')
      });

      args.addAdapter(async () => {
        return createStorage(storageKey, 'session')
      });

      // args.addAdapter(async () => {
      //   return createStorage(storageKey, 'indexDb')
      // }); // @TODO
    } else {
      await Promise.resolve(cb(storageKey, args));
    }
  };

  enableState(configurator, callback);
}



/////////////////////
// Readme
// import { createStorage } from '@equinor/fusion-framework-module-state/adapters';

// enableAppState(configurator as unknown as IAppConfigurator, (namespace, args) => {
//   args.addAdapter(async () => {
//     return new MyCustomStorageAdapter(namespace);
//   });

//   args.addAdapter(async () => {
//     return createStorage(namespace, 'session');
//   });
// });

// MyCustomStorageAdapter
// export class LocalStorageAdapter<TType extends AllowedValue> extends StorageAdapter<TType> {
// }
