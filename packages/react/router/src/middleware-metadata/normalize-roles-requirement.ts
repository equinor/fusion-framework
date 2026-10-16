import type { RequireRolesMode, RolesMiddlewareMetadata } from './types.js';

/** Modes accepted by `requireRoles`, in documentation order. */
const supportedModes: readonly RequireRolesMode[] = ['all', 'any'];

/**
 * Describes an unexpected value for a diagnostic without serializing arbitrary objects.
 *
 * @param value - Value received from the caller.
 * @returns A short, human-readable description of the value.
 */
const describeValue = (value: unknown): string => {
  // Strings are quoted so blank and case differences stay visible in the message.
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  // `typeof null` is 'object'; name it explicitly so the diagnostic is not misleading.
  if (value === null) {
    return 'null';
  }
  // Arrays are named, not serialized, to keep messages short and free of user data.
  if (Array.isArray(value)) {
    return 'an array';
  }
  return typeof value === 'object' ? 'an object' : String(value);
};

/**
 * Validates and normalizes a `requireRoles` declaration into inspectable route metadata.
 *
 * This is the single normalization used by the runtime helper and the one a build consumer
 * should apply to statically extracted `requireRoles(...)` arguments, so published metadata
 * and runtime behaviour cannot drift.
 *
 * - Role names are exact and case-sensitive. Surrounding whitespace is trimmed; nothing else is
 *   changed.
 * - Duplicates (after trimming) are removed, keeping the first occurrence and declaration order.
 * - The mode defaults to `'all'`; the only other mode is `'any'`.
 *
 * @param roles - Roles V2 access-role names passed to `requireRoles`.
 * @param options - Options passed to `requireRoles`.
 * @returns Frozen `{ kind: 'roles', mode, roles }` metadata.
 * @throws {TypeError} When `roles` is not an array, is empty, contains a non-string or blank
 *   name, when `options` is not an object, or when `mode` is not `'all'` or `'any'`.
 *
 * @example
 * ```ts
 * normalizeRolesRequirement([' Reports.Read ', 'Reports.Read']);
 * // { kind: 'roles', mode: 'all', roles: ['Reports.Read'] }
 *
 * normalizeRolesRequirement(['Reports.Read', 'Reports.Admin'], { mode: 'any' });
 * // { kind: 'roles', mode: 'any', roles: ['Reports.Read', 'Reports.Admin'] }
 * ```
 */
export const normalizeRolesRequirement = (
  roles: unknown,
  options?: unknown,
): RolesMiddlewareMetadata => {
  // JavaScript callers and dynamic values bypass the type system, so the shape is checked here.
  if (!Array.isArray(roles)) {
    throw new TypeError(
      `requireRoles: expected an array of Roles V2 access-role names, received ${describeValue(roles)}.`,
    );
  }
  // An empty requirement would grant access without any check, which is never intended.
  if (roles.length === 0) {
    throw new TypeError(
      'requireRoles: at least one access-role name is required. Remove the middleware instead of passing an empty array.',
    );
  }
  const normalized: string[] = [];
  // Validate every entry so the diagnostic points at the exact offending position.
  for (const [index, role] of roles.entries()) {
    // Non-string entries come from untyped callers and cannot be Roles V2 identifiers.
    if (typeof role !== 'string') {
      throw new TypeError(
        `requireRoles: role at index ${index} must be a string access-role name, received ${describeValue(role)}.`,
      );
    }
    const name = role.trim();
    // A blank name cannot identify a Roles V2 access role and would weaken an `any` requirement.
    if (!name) {
      throw new TypeError(
        `requireRoles: role at index ${index} is blank. Use exact Roles V2 access-role names, for example 'Reports.Read'.`,
      );
    }
    // Keep the first occurrence so declaration order is preserved for diagnostics and manifests.
    if (!normalized.includes(name)) {
      normalized.push(name);
    }
  }

  // `undefined` means defaults; any other non-object (including arrays) is a call-site mistake.
  if (
    options !== undefined &&
    (typeof options !== 'object' || options === null || Array.isArray(options))
  ) {
    throw new TypeError(
      `requireRoles: options must be an object such as { mode: 'any' }, received ${describeValue(options)}.`,
    );
  }
  const declaredMode = (options as { mode?: unknown } | undefined)?.mode;
  // Only an omitted mode defaults; `null`, 'ALL' or 'some' are rejected instead of silently defaulting.
  const mode = declaredMode === undefined ? 'all' : declaredMode;
  // Reject unknown modes so a typo can never change how the requirement is combined.
  if (!supportedModes.includes(mode as RequireRolesMode)) {
    throw new TypeError(
      `requireRoles: unsupported mode ${describeValue(mode)}. Use 'all' (every role, the default) or 'any' (at least one role).`,
    );
  }

  return Object.freeze({
    kind: 'roles',
    mode: mode as RequireRolesMode,
    roles: Object.freeze(normalized),
  });
};

export default normalizeRolesRequirement;
