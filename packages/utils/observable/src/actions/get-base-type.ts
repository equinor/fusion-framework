import { matchActionSuffix } from './match-action-suffix';
import { actionSuffixDivider } from './action-suffix-divider';

type BaseType<T extends string> = T extends `${infer A}${typeof actionSuffixDivider}${infer R}`
  ? A
  : never;

/**
 * Extracts the base type from an action type string.
 *
 * @template T - The action type string.
 * @param type - The action type string to extract the base type from.
 * @returns The base type of the action type string, or `never` if the input string does not match the expected format.
 */
export function getBaseType<T extends string>(type: T): BaseType<T> {
  return type.replace(matchActionSuffix('\\w+$'), '') as BaseType<T>;
}