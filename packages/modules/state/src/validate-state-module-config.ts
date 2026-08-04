import { StateModuleConfigSchema } from './state-module-config-schema.js';
import type { StateModuleConfig } from './StateModuleConfig.js';

/** Validates an unknown value against the state module configuration schema. */
export const validateStateModuleConfig = (config: unknown): config is StateModuleConfig =>
  StateModuleConfigSchema.safeParse(config).success;