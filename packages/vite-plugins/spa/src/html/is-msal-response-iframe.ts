/**
 * Window-shaped values needed to detect an MSAL redirect iframe, narrowed for testability.
 */
export interface MsalResponseIframeWindow {
  parent: unknown;
  location: { hash: string };
}

/**
 * Detects whether the current window is the hidden iframe MSAL uses to process a redirect
 * response during silent token renewal or login.
 *
 * MSAL Browser navigates a hidden iframe to the app's redirect URI, which reloads this bootstrap
 * script. Callers must stop before resolving service discovery or the portal in that case,
 * otherwise a scoped request is sent without an access token while the parent frame is still
 * completing authentication. The check requires both an embedded window and an MSAL response
 * parameter in the URL fragment so ordinary embedded Fusion applications keep bootstrapping.
 *
 * @param win - Window-like object to inspect; defaults to the global `window`.
 * @returns `true` when the window is embedded and its URL fragment carries an MSAL response parameter.
 */
export function isMsalResponseIframe(win: MsalResponseIframeWindow = window): boolean {
  const isEmbedded = win.parent !== win;
  // Top-level windows never carry MSAL's hidden redirect iframe, regardless of the URL.
  if (!isEmbedded) {
    return false;
  }

  const hash = win.location.hash.replace(/^#/, '');
  // An embedded window without a fragment is an ordinary embedded app, not an auth response.
  if (!hash) {
    return false;
  }

  const params = new URLSearchParams(hash);
  return params.has('code') || params.has('error') || params.has('state');
}
