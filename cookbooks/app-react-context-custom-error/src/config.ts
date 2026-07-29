import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import {
  FusionContextSearchError,
  enableContext,
} from '@equinor/fusion-framework-react-module-context';

export const configure: AppModuleInitiator = (configurator) => {
  enableContext(configurator, async (builder) => {
    builder.setContextFilter((items) => {
      // Surface the intentional custom error when context search returns nothing.
      if (items.length === 0) {
        throw new FusionContextSearchError({
          title: 'This is a custom error',
          description: 'Could not find any items in the context. This error is intentional',
        });
      }
      return items;
    });
    // builder.setContextClient({
    //     get: async () => {
    //         return undefined as unknown as ContextItem;
    //     },
    //     query: async () => {
    //         throw new FusionContextSearchError({
    //             title: 'This is a custom error',
    //             description: 'This error is intentional',
    //         });
    //     },
    // });
  });
};

export default configure;
