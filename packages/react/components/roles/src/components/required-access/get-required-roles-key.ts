/**
 * Identifies an all-required role check independently of array identity, ordering, or duplicates.
 * @param required - Access-role names, normalized like the Roles provider's hasRole check.
 * @returns A collision-free key preserving case-sensitive role names.
 */
export const getRequiredRolesKey = (required: readonly string[]): string => {
  const names = new Set<string>();
  // Mirror provider normalization so equivalent requirements preserve protected child state.
  for (const role of required) {
    const name = role.trim();
    // Blank names do not participate in the provider's all-required access check.
    if (name) {
      names.add(name);
    }
  }
  return JSON.stringify([...names].sort());
};
