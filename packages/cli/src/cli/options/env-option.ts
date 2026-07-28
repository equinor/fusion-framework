import { createEnvOption } from './create-env-option.js';

/**
 * Default environment option that allows the development environment.
 */
export const envOption = createEnvOption({ allowDev: true });

export default envOption;
