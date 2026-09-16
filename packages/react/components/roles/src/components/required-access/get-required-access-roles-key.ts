/**
 * Identifies an all-required access-role check independently of array identity, ordering, or
 * duplicates.
 * @param requiredAccessRoles - Access-role names, normalized like the provider's hasAccessRole check.
 * @returns A collision-free key preserving case-sensitive access-role names.
 */
export const getRequiredAccessRolesKey = (requiredAccessRoles: readonly string[]): string => {
  const names = new Set<string>();
  // Mirror provider normalization so equivalent requirements preserve protected child state.
  for (const accessRoleName of requiredAccessRoles) {
    const name = accessRoleName.trim();
    // Blank names do not participate in the provider's all-required access-role check.
    if (name) {
      names.add(name);
    }
  }
  return JSON.stringify([...names].sort());
};
