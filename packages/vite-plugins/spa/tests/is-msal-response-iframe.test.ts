import { describe, expect, it } from 'vitest';

import { isMsalResponseIframe } from '../src/html/is-msal-response-iframe';

describe('isMsalResponseIframe', () => {
  it.each(['code', 'error', 'state'])(
    'detects an embedded MSAL response iframe carrying "%s"',
    (param) => {
      const win = {
        parent: {},
        location: { hash: `#${param}=abc&other=1` },
      };

      expect(isMsalResponseIframe(win)).toBe(true);
    },
  );

  it('does not treat an ordinary embedded application without an MSAL response fragment as an iframe', () => {
    const win = {
      parent: {},
      location: { hash: '' },
    };

    expect(isMsalResponseIframe(win)).toBe(false);
  });

  it('does not treat an embedded window with an unrelated hash as an MSAL response iframe', () => {
    const win = {
      parent: {},
      location: { hash: '#tab=details' },
    };

    expect(isMsalResponseIframe(win)).toBe(false);
  });

  it('ignores an MSAL response fragment at the top level, outside an iframe', () => {
    const win: { parent: unknown; location: { hash: string } } = {
      parent: undefined,
      location: { hash: '#code=abc&state=xyz' },
    };
    win.parent = win;

    expect(isMsalResponseIframe(win)).toBe(false);
  });
});
