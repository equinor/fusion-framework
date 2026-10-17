import { describe, expect, it } from 'vitest';

import { isMsalResponseIframe } from '../src/html/is-msal-response-iframe';

describe('isMsalResponseIframe', () => {
  it.each(['code', 'error', 'state'])(
    'detects an embedded MSAL response iframe carrying "%s" in the fragment',
    (param) => {
      const win = {
        parent: {},
        location: { hash: `#${param}=abc&other=1`, search: '' },
      };

      expect(isMsalResponseIframe(win)).toBe(true);
    },
  );

  it.each(['code', 'error', 'state'])(
    'detects an embedded MSAL response iframe carrying "%s" in the query string (response_mode: query)',
    (param) => {
      const win = {
        parent: {},
        location: { hash: '', search: `?${param}=abc&other=1` },
      };

      expect(isMsalResponseIframe(win)).toBe(true);
    },
  );

  it('detects a hybrid response split across both the query string and the fragment', () => {
    const win = {
      parent: {},
      location: { hash: '#state=xyz', search: '?client_info=abc' },
    };

    expect(isMsalResponseIframe(win)).toBe(true);
  });

  it('does not treat an ordinary embedded application without an MSAL response parameter as an iframe', () => {
    const win = {
      parent: {},
      location: { hash: '', search: '' },
    };

    expect(isMsalResponseIframe(win)).toBe(false);
  });

  it('does not treat an embedded window with an unrelated hash or query as an MSAL response iframe', () => {
    const win = {
      parent: {},
      location: { hash: '#tab=details', search: '?page=2' },
    };

    expect(isMsalResponseIframe(win)).toBe(false);
  });

  it('ignores an MSAL response parameter at the top level, outside an iframe', () => {
    const win: { parent: unknown; location: { hash: string; search: string } } = {
      parent: undefined,
      location: { hash: '#code=abc&state=xyz', search: '' },
    };
    win.parent = win;

    expect(isMsalResponseIframe(win)).toBe(false);
  });
});
