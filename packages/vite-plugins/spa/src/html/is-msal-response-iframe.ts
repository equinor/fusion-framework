/**
 * Window-shaped values needed to detect an MSAL redirect iframe, narrowed for testability.
 */
export interface MsalResponseIframeWindow {
  parent: unknown;
  location: { hash: string; search: string };
}

/**
 * Detects whether the current window is the hidden iframe MSAL uses to process a redirect
 * response during silent token renewal or login.
 *
 * MSAL Browser navigates a hidden iframe to the app's redirect URI, which reloads this bootstrap
 * script. Callers must stop before resolving service discovery or the portal in that case,
 * otherwise a scoped request is sent without an access token while the parent frame is still
 * completing authentication. The check requires both an embedded window and an MSAL response
 * parameter so ordinary embedded Fusion applications keep bootstrapping. MSAL's `response_mode`
 * is configurable (`query`, `fragment`, or a hybrid of both), so the response parameter is looked
 * up in both `location.hash` and `location.search` rather than assuming fragment-only responses.
 *
 * @param win - Window-like object to inspect; defaults to the global `window`.
 * @returns `true` when the window is embedded and its URL carries an MSAL response parameter.
 */
export function isMsalResponseIframe(win: MsalResponseIframeWindow = window): boolean {
  const isEmbedded = win.parent !== win;
  // Top-level windows never carry MSAL's hidden redirect iframe, regardless of the URL.
  if (!isEmbedded) {
    return false;
  }

  const hashParams = new URLSearchParams(win.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(win.location.search.replace(/^\?/, ''));
  // an embedded window with neither a fragment nor a query response is an ordinary embedded app
  return ['code', 'error', 'state'].some(
    (param) => hashParams.has(param) || searchParams.has(param),
  );
}
