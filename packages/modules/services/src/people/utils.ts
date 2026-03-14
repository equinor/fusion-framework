import type { ApiPerson } from './api-models';
import { ApiVersion } from './static';

// type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2' | 'v4'>;

const requiredApiPersonAttributes = {
  [ApiVersion.v2]: [
    'azureUniqueId',
    /** TODO - has to be more required attributes to identify V2??? */
  ] satisfies Array<keyof ApiPerson<'v2'>>,
  [ApiVersion.v4]: [
    /** TODO - has to be more required attributes to identify V4??? */
    'azureUniqueId',
  ] satisfies Array<keyof ApiPerson<'v4'>>,
};

/**
 * Creates a type-guard function that validates whether a value conforms
 * to the {@link ApiPerson} shape for a given API version.
 *
 * The guard checks that the value contains all required attributes
 * defined for the specified version.
 *
 * @template V - API version key (e.g. `'v2'` or `'v4'`).
 * @param version - The API version to validate against.
 * @returns A type-guard function that narrows `T` to `ApiPerson<V>`.
 *
 * @example
 * ```ts
 * const isV4Person = isApiPerson('v4');
 * if (isV4Person(data)) {
 *   console.log(data.azureUniqueId);
 * }
 * ```
 */
export const isApiPerson = <V extends keyof typeof ApiVersion>(version: V) => {
  /** todo add options for more strict check */
  return <T>(value: T): value is T extends ApiPerson<V> ? T : never => {
    /** early escape if value is not defined or not a object */
    if (typeof value !== 'object') {
      return false;
    }
    const attr = Object.keys(value as object);
    const requiredAttr = requiredApiPersonAttributes[ApiVersion[version]];
    const result = requiredAttr.every((key) => attr.includes(key));
    return result;
  };
};
