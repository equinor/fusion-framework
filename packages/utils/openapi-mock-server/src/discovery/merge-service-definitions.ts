import type { ServiceMockDefinition } from './discover-services.js';

/** Merges `paths` overrides per path *and* method, so a later group only replaces the methods it declares. */
function mergePaths(
  existing: ServiceMockDefinition['paths'],
  incoming: ServiceMockDefinition['paths'],
): ServiceMockDefinition['paths'] {
  // Neither group has any paths override at all: nothing to merge.
  if (!existing && !incoming) return undefined;
  const merged: NonNullable<ServiceMockDefinition['paths']> = { ...existing };
  // Walk the incoming group's paths, one at a time, so each can be merged at the method level.
  for (const [path, methods] of Object.entries(incoming ?? {})) {
    // Merge at the method level, so overriding one method of a path keeps its other methods.
    merged[path] = { ...merged[path], ...methods };
  }
  return merged;
}

/**
 * Merges several groups of {@link ServiceMockDefinition}s into one, in
 * ascending precedence — a service key present in more than one group is
 * fully replaced by its definition in the *later* group, never merged
 * field-by-field.
 *
 * The one exception is a **fields-only** definition (no `document`, e.g. from
 * a lone `<key>.overrides.*` sidecar — see {@link discoverServices}):
 * its `fields`/`paths` are merged onto the nearest earlier definition for that key
 * instead, so an app can override a preset's fields or routes without duplicating
 * its whole spec.
 *
 * @remarks
 * This is what lets a shared baseline (e.g. {@link fusionPreset}) sit
 * underneath an app's own specs: pass the baseline group first and the app's
 * discovered specs last, and only the services the app actually provides are
 * replaced.
 *
 * @param groups - Definition groups, lowest precedence first.
 * @returns One definition per service key, each from its highest-precedence group.
 * @throws {Error} If a fields-only definition's key has no earlier definition to apply its fields to.
 *
 * @example
 * ```typescript
 * const definitions = mergeServiceDefinitions(Object.values(fusionPreset()), await discoverServices('./mocks'));
 * ```
 */
export function mergeServiceDefinitions(
  ...groups: ServiceMockDefinition[][]
): ServiceMockDefinition[] {
  const byKey = new Map<string, ServiceMockDefinition>();
  // Walk groups in ascending precedence so a later group overwrites an earlier one.
  for (const group of groups) {
    // A later group's definitions are applied in order, one key at a time.
    for (const definition of group) {
      // A definition with its own document always fully replaces an earlier one for this key.
      if (definition.document) {
        byKey.set(definition.key, definition);
        // Already handled: skip the fields-only merge branch below.
        continue;
      }

      // Fields-only: merge onto whichever definition already supplies the schema.
      const existing = byKey.get(definition.key);
      // No earlier definition to apply these fields to — this override is unresolvable.
      if (!existing) {
        throw new Error(
          `Fields-only override for service "${definition.key}" has no earlier definition to apply its fields to — add a "<key>.openapi.*" spec, or register a source (e.g. a preset) that provides one before this one.`,
        );
      }
      // Keep the existing document; the later group's fields/paths/router win over the existing ones per-key.
      byKey.set(definition.key, {
        ...existing,
        fields: { ...existing.fields, ...definition.fields },
        paths: mergePaths(existing.paths, definition.paths),
        router: definition.router ?? existing.router,
      });
    }
  }
  return Array.from(byKey.values());
}

export default mergeServiceDefinitions;
