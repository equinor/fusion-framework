import { createEnvOption } from './env.js';

/**
 * Default environment option that allows the development environment.
 */
export const envOption = createEnvOption({ allowDev: true });

export default envOption;
