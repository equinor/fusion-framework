import type { ContextItem } from '@equinor/fusion-framework-module-context';

import type { ContextNavigationAdapter } from '../adapters/types.js';
import { normalizePathFromURL } from '../helpers/index.js';

/** Placeholder written where the decoded value sits, so the adapter has to fill it in. */
const PROBE_SEGMENT = '__fusion-context-probe__';

/**
 * Check whether a URL identifies a context by an alias (an app key or slug) instead of its id.
 *
 * Apps with custom path hooks can put an alias in the URL, so the decoded value differs
 * from `context.id` while the URL still belongs to the active context. Encoding the active
 * context against the current URL is not proof on its own: a generator that keeps the path
 * unchanged would match any URL. Each matching segment is probed individually with a
 * placeholder, leaving unrelated occurrences intact. The URL counts as the context's only
 * when the probe changes the decoded value and the adapter writes the original value back.
 *
 * Only whole path segments after the app base path are probed. When the value does not fill
 * a whole segment, the function returns `false` and the caller resolves the context instead.
 *
 * @param args.adapter - Adapter that decoded `urlContextValue` from `currentURL`.
 * @param args.appKey - Active app key; segments of the `/apps/{appKey}` base are not probed.
 * @param args.context - The active context.
 * @param args.urlContextValue - The value the adapter decoded from `currentURL`.
 * @param args.currentURL - The current browser URL.
 * @returns `true` when encoding `context` produces the decoded value at the same place.
 */
export function urlIdentifiesContext(args: {
  adapter: ContextNavigationAdapter;
  appKey: string;
  context: ContextItem;
  urlContextValue: string;
  currentURL: URL;
}): boolean {
  const { adapter, appKey, context, urlContextValue, currentURL } = args;
  const appBase = `/apps/${appKey}`;

  // Outside the app base the segments can't be mapped back reliably — don't claim a match.
  if (!currentURL.pathname.startsWith(`${appBase}/`)) {
    return false;
  }

  const segments = currentURL.pathname.slice(appBase.length).split('/');
  // Probe only one candidate at a time so a repeated key in the route tail stays intact.
  return segments.some((segment, index) => {
    // Nonmatching route segments cannot encode the alias being checked.
    if (segment !== urlContextValue) {
      return false;
    }

    const probeSegments = [...segments];
    probeSegments[index] = PROBE_SEGMENT;
    const probeURL = new URL(currentURL.href);
    probeURL.pathname = `${appBase}${probeSegments.join('/')}`;

    // An unrelated occurrence must not let a path-preserving generator prove identity.
    if (adapter.decode(probeURL) === urlContextValue) {
      return false;
    }

    const encoded = adapter.encode({ context, currentURL: probeURL });
    return !!encoded && normalizePathFromURL(encoded) === normalizePathFromURL(currentURL);
  });
}
