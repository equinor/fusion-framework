/**
 * Explains a star re-export whose target cannot be read, so the route module's
 * capabilities are unknown rather than silently incomplete.
 *
 * @param module - Project-relative route module path.
 * @param importer - Project-relative path of the module containing the re-export.
 * @param specifier - Re-export specifier as written.
 * @returns Diagnostic message.
 */
export function describeUnresolvedReexport(
  module: string,
  importer: string,
  specifier: string,
): string {
  const location = importer === module ? '' : ` (via ${importer})`;
  return `Route module ${module} re-exports everything from "${specifier}"${location}, which cannot be read statically, so capabilities such as clientLoader or middleware may be missing from the graph. Re-export route exports by name instead, for example export { clientLoader, middleware } from '${specifier}'.`;
}
