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
 * ascending precedence. A later `serviceDiscovery: 'merge'` definition merges
 * onto the earlier definition for its key; other later definitions replace it.
 *
 * @remarks
 * This is what lets a shared baseline (e.g. {@link fusionPreset}) sit
 * underneath an app's own specs: pass the baseline group first and the app's
 * discovered specs last, and only the services the app actually provides are
 * replaced.
 *
 * @param groups - Definition groups, lowest precedence first.
 * @returns One definition per service key, each from its highest-precedence group.
 * @throws {Error} If a merge has no earlier definition or a complete definition has no schema.
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
      const existing = byKey.get(definition.key);
      // New definitions guard pre-production services against accidentally shadowing a registered service.
      if (definition.serviceDiscovery === 'new' && existing) {
        throw new Error(
          `Mock service "${definition.key}" is marked as new but an earlier definition already exists.`,
        );
      }
      // Complete direct and replacement definitions own their full runtime behavior.
      if (definition.serviceDiscovery !== 'merge') {
        // A complete definition cannot generate responses without a schema.
        if (!definition.document) {
          throw new Error(`Mock service "${definition.key}" must provide a schema.`);
        }
        byKey.set(definition.key, definition);
        // Replacement modes do not inherit any behavior from an earlier layer.
        continue;
      }

      // Merge definitions inherit the earlier service and replace only behavior they explicitly provide.
      // No earlier definition means there is no schema or behavior to inherit.
      if (!existing) {
        throw new Error(
          `Mock service override "${definition.key}" has no earlier definition to merge with.`,
        );
      }
      // Preserve inherited behavior while merging maps and allowing an explicitly supplied schema/router to win.
      byKey.set(definition.key, {
        ...existing,
        ...definition,
        document: definition.document ?? existing.document,
        fields: { ...existing.fields, ...definition.fields },
        paths: mergePaths(existing.paths, definition.paths),
        router: definition.router ?? existing.router,
      });
    }
  }
  return Array.from(byKey.values());
}

export default mergeServiceDefinitions;
