import type { AppManifest } from '@equinor/fusion-framework-module-app';
import { resolveSitemap } from '@equinor/fusion-framework-react-router/build';
import type { AppManifestInput } from './define-app-manifest.js';
import { mergeAppManifests } from './merge-app-manifests.js';

/**
 * Resolves manifest authoring values before merging them with a package manifest.
 *
 * JSON, script and inline-function manifests share this normalization so registry
 * filenames cannot leak into a serialized manifest.
 *
 * @param input - Partial manifest with serialized routes or an explicit registry pointer.
 * @param base - Package-derived manifest to extend.
 * @param root - Application root for registry paths; defaults to the working directory.
 * @returns A merged manifest containing only serialized route entries.
 * @throws When an explicitly configured registry or its metadata cannot be read.
 */
export async function resolveAppManifestInput(
  input: AppManifestInput,
  base: AppManifest,
  root: string = process.cwd(),
): Promise<AppManifest> {
  const { routes, ...fields } = input;
  const sitemap =
    typeof routes === 'string' ? await resolveSitemap({ root, routesFile: routes }) : routes;
  // Replace only the authoring pointer; preserve all other manifest overrides.
  return mergeAppManifests(base, {
    ...fields,
    ...(sitemap !== undefined ? { routes: sitemap } : {}),
  });
}
