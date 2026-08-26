/**
 * True if `error` is Node's "module/package not found" error, for either CJS or ESM resolution.
 *
 * @param error - The value caught from a failed `import()` or `require()`.
 * @param moduleName - Optional package name that must be identified as missing by the error.
 * @returns Whether `error` represents the requested missing module/package.
 */
export function isModuleNotFoundError(error: unknown, moduleName?: string): boolean {
  // ESM raises ERR_MODULE_NOT_FOUND ("Cannot find package"), CJS raises MODULE_NOT_FOUND ("Cannot find module")
  const code = error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;
  const hasMissingModuleCode = code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND';
  const identifiesRequestedModule =
    moduleName === undefined ||
    (error instanceof Error &&
      (error.message.includes(`'${moduleName}'`) || error.message.includes(`"${moduleName}"`)));
  return hasMissingModuleCode && identifiesRequestedModule;
}
