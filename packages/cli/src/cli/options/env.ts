import { createOption } from 'commander';

import { resolveDefaultEnv, FusionEnv } from '@equinor/fusion-framework-cli/bin';

/**
 * Creates an environment option for Fusion Framework CLI commands.
 *
 * @param options - Configuration options for the environment option.
 * @param options.default - The default environment to use if not specified.
 * @param options.allowDev - Whether to allow the development environment.
 * @returns A configured Commander option for the environment.
 */
export const createEnvOption = (options: { default?: FusionEnv; allowDev: boolean }) => {
  const allowedEnvs = Object.values(FusionEnv).filter((env) =>
    env === FusionEnv.Development ? options.allowDev : true,
  );
  return createOption('-e, --env <string>', `Set environment [${allowedEnvs.join(', ')}, custom].`)
    .env('FUSION_ENV')
    .default(options.default ?? resolveDefaultEnv(options.allowDev));
};

/**
 * Default environment option that allows the development environment.
 */
export const envOption = createEnvOption({ allowDev: true });

export default envOption;
