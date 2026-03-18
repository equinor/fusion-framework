/**
 * Redirects the browser to the specified URL.
 *
 * If the browser has not navigated away within the given timeout, the returned
 * promise is rejected. This acts as a safeguard against redirect failures.
 *
 * @internal
 *
 * @param url - Endpoint to navigate to
 * @param timeout - Maximum milliseconds to wait before considering the redirect failed. Defaults to `3000`.
 * @param history - When `true`, uses `location.assign()` so the current page is kept in browser history.
 *   Otherwise uses `location.replace()` which replaces the current history entry.
 * @returns A promise that rejects after the timeout (it never resolves because a successful redirect
 *   causes the page to unload)
 */
export const redirect = (url: string, timeout = 3000, history?: boolean): Promise<void> => {
  history ? window.location.assign(url) : window.location.replace(url);
  return new Promise((_, reject) => setTimeout(reject, timeout));
};
