import { useCallback, useEffect, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import { HELP_OPEN_EVENT } from './help-open-event.js';
import { parseHelpRequest, type HelpRequest } from './parse-help-request.js';

/** Current help request, panel session, and navigation, returned by {@link useHelpRequest}. */
export interface HelpRequestState {
  /** The page shown in the help panel, or `undefined` while the panel is closed. */
  readonly request: HelpRequest | undefined;
  /** Increments each time an app opens help; `undefined` while the panel is closed. */
  readonly session: number | undefined;
  /** Shows another help page in the open panel, e.g. from the sidebar. */
  readonly navigate: (request: HelpRequest) => void;
  /** Closes the help panel. */
  readonly close: VoidFunction;
}

/**
 * Listens for `@Portal::FusionHelp::open` — the event `useHelpCenter()` dispatches from an app,
 * which bubbles from the app's event module to the portal's — and exposes it as panel state.
 *
 * Every event yields a new request object and session, even for the same article, so reopening
 * help refetches the article and the sidebar list. `navigate` changes the page without starting
 * a new session, so browsing keeps the loaded sidebar.
 *
 * @returns The current request, session, and `navigate`/`close` callbacks.
 *
 * @example
 * ```tsx
 * const { request, close } = useHelpRequest();
 * return <SideSheet isOpen={!!request} onClose={close} />;
 * ```
 */
export const useHelpRequest = (): HelpRequestState => {
  const fusion = useFramework();
  const [request, setRequest] = useState<HelpRequest>();
  const [session, setSession] = useState<number>();

  useEffect(
    () =>
      // addEventListener returns its own teardown, so it doubles as the effect cleanup.
      fusion.modules.event.addEventListener(HELP_OPEN_EVENT, (event) => {
        const parsed = parseHelpRequest(event.detail);
        // Malformed details are ignored rather than opening an empty panel.
        if (!parsed) return;
        setRequest(parsed);
        setSession((previous) => (previous ?? 0) + 1);
      }),
    [fusion],
  );

  const navigate = useCallback((next: HelpRequest) => setRequest(next), []);
  const close = useCallback(() => {
    setRequest(undefined);
    setSession(undefined);
  }, []);

  return { request, session, navigate, close };
};

export default useHelpRequest;
