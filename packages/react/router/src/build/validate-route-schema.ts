import type { RouterSchema } from '../types.js';

/**
 * Validates literal route metadata before it is serialized into a manifest.
 * @param value - Source-only route metadata.
 * @param file - Source filename included in authoring errors.
 * @returns The supported sitemap fields with validated string descriptions.
 * @throws When metadata does not match the route schema contract.
 */
export function validateRouteSchema(value: unknown, file: string): RouterSchema {
  // Runtime values cannot be serialized as declarative route metadata.
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${file}: route schema must be an object literal.`);
  }
  const schema: RouterSchema = {};
  const properties: [string, unknown][] = Object.entries(value);
  // Only public sitemap fields belong in generated manifests.
  for (const [name, entry] of properties) {
    // Other handle metadata is not part of the sitemap contract.
    if (name !== 'description' && name !== 'params' && name !== 'search') continue;
    // Descriptions and parameter maps have different JSON shapes.
    if (name === 'description') {
      // Coercion would hide invalid authoring input.
      if (typeof entry !== 'string') throw new Error(`${file}: description must be a string.`);
      schema.description = entry;
    } else {
      // Parameter descriptions must be named entries, not arrays or primitives.
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        throw new Error(`${file}: ${name} must contain string descriptions.`);
      }
      const descriptions: Record<string, string> = {};
      // Preserve parameter names as own properties, including prototype-like names.
      for (const [parameter, description] of Object.entries(entry)) {
        // Invalid descriptions must not silently disappear from the sitemap.
        if (typeof description !== 'string') {
          throw new Error(`${file}: ${name}.${parameter} must be a string.`);
        }
        Object.defineProperty(descriptions, parameter, { value: description, enumerable: true });
      }
      schema[name] = descriptions;
    }
  }
  return schema;
}
