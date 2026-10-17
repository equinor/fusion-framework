/**
 * Normalizes a URL or origin string to its origin.
 *
 * Relative values are resolved against `base`, so a service-discovery URI such as
 * `/@fusion-api/context` maps to the portal origin.
 *
 * @param value - An absolute URL, origin, or relative path.
 * @param base - Base URL used to resolve relative values.
 * @returns The origin, or `undefined` when the value cannot be parsed.
 */
export const toOrigin = (value: string, base?: string): string | undefined => {
  try {
    return new URL(value, base).origin;
  } catch {
    return undefined;
  }
};
