import { DEFAULT_OCTOPUS_URL } from '@equinor/fusion-framework-vite-plugin-octopus';

/**
 * Resolves the Octopus address from the `--octopus [url]` option.
 *
 * @param option - Value of `--octopus`: `true` when given without a URL.
 * @returns The Octopus address without a trailing slash, or `undefined` when the option is not given.
 *
 * @example
 * ```ts
 * resolveOctopusUrl(true); // 'http://localhost:2000'
 * resolveOctopusUrl('http://localhost:2100/'); // 'http://localhost:2100'
 * ```
 */
export const resolveOctopusUrl = (option: string | boolean | undefined): string | undefined => {
  if (option === undefined || option === false) {
    return undefined;
  }
  return option === true ? DEFAULT_OCTOPUS_URL : option.replace(/\/$/, '');
};
