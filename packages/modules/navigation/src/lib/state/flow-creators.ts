import { go } from './go.js';
import { navigate } from './navigate.js';
import { pop } from './pop.js';
import { validateCurrentLocation } from './validate-current-location.js';

/** Collection of flow creators for history state management. */
export const flowCreators = { navigate, go, pop, validateCurrentLocation };
