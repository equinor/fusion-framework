import { actionSuffixDivider } from './action-suffix-divider';

/**
 * Creates a matcher for action types ending with the requested suffix.
 *
 * @param suffix - The action suffix to match.
 * @returns A regular expression that matches the suffix at the end of an action type.
 */
export const matchActionSuffix = (suffix: string): RegExp =>
  new RegExp(`${actionSuffixDivider}${suffix}$`);
