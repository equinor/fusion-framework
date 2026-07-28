import { go } from './go';
import { navigate } from './navigate';
import { pop } from './pop';
import { validateCurrentLocation } from './validate-current-location';

/** Collection of flow creators for history state management. */
export const flowCreators = { navigate, go, pop, validateCurrentLocation };
