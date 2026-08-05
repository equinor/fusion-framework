import { describe, expect, it } from 'vitest';

import { consumeOwnNavToken, isInAppScope } from '../guard-handlers';
import { stripQueryParams } from '../helpers';
import type { OwnNavigationTokens } from '../apply-navigation';

describe('isInAppScope', () => {
  it('returns true when pathname equals the app base path', () => {
    const url = new URL('/apps/my-app', 'https://example.com');
    expect(isInAppScope(url, 'my-app')).toBe(true);
  });

  it('returns true when pathname starts with the app base path followed by /', () => {
    const url = new URL('/apps/my-app/some/context', 'https://example.com');
    expect(isInAppScope(url, 'my-app')).toBe(true);
  });

  it('returns false when pathname belongs to a different app', () => {
    const url = new URL('/apps/other-app/page', 'https://example.com');
    expect(isInAppScope(url, 'my-app')).toBe(false);
  });

  it('returns false when pathname is a prefix match but not a path segment boundary', () => {
    // "/apps/my-appx" should NOT match "/apps/my-app"
    const url = new URL('/apps/my-appx', 'https://example.com');
    expect(isInAppScope(url, 'my-app')).toBe(false);
  });

  it('returns false for unrelated paths', () => {
    const url = new URL('/settings/profile', 'https://example.com');
    expect(isInAppScope(url, 'my-app')).toBe(false);
  });
});

describe('consumeOwnNavToken', () => {
  it('returns true and removes the token when URL matches a stored token', () => {
    const tokens: OwnNavigationTokens = new Set(['/apps/my-app/ctx-1']);
    const url = new URL('/apps/my-app/ctx-1', 'https://example.com');

    expect(consumeOwnNavToken(url, tokens)).toBe(true);
    expect(tokens.has('/apps/my-app/ctx-1')).toBe(false);
  });

  it('returns false when URL does not match any stored token', () => {
    const tokens: OwnNavigationTokens = new Set(['/apps/my-app/ctx-1']);
    const url = new URL('/apps/my-app/ctx-2', 'https://example.com');

    expect(consumeOwnNavToken(url, tokens)).toBe(false);
    // The existing token should remain untouched.
    expect(tokens.has('/apps/my-app/ctx-1')).toBe(true);
  });

  it('returns false when the token set is empty', () => {
    const tokens: OwnNavigationTokens = new Set();
    const url = new URL('/apps/my-app/ctx-1', 'https://example.com');

    expect(consumeOwnNavToken(url, tokens)).toBe(false);
  });

  it('consumes only the matching token when multiple tokens exist', () => {
    const tokens: OwnNavigationTokens = new Set(['/apps/my-app/ctx-1', '/apps/my-app/ctx-2']);
    const url = new URL('/apps/my-app/ctx-1', 'https://example.com');

    expect(consumeOwnNavToken(url, tokens)).toBe(true);
    expect(tokens.has('/apps/my-app/ctx-1')).toBe(false);
    expect(tokens.has('/apps/my-app/ctx-2')).toBe(true);
  });

  it('normalizes trailing slashes when comparing', () => {
    const tokens: OwnNavigationTokens = new Set(['/apps/my-app/ctx-1']);
    const url = new URL('/apps/my-app/ctx-1/', 'https://example.com');

    expect(consumeOwnNavToken(url, tokens)).toBe(true);
  });
});

describe('stripQueryParams', () => {
  it('removes all query params', () => {
    const url = new URL('/apps/my-app?tab=settings&filter=active', 'https://example.com');
    stripQueryParams(url);
    expect(url.search).toBe('');
  });

  it('removes framework params too', () => {
    const url = new URL('/apps/my-app?$contextId=abc-123&tab=settings', 'https://example.com');
    stripQueryParams(url);
    expect(url.search).toBe('');
  });

  it('handles URLs with no query params', () => {
    const url = new URL('/apps/my-app', 'https://example.com');
    stripQueryParams(url);
    expect(url.search).toBe('');
  });

  it('preserves pathname', () => {
    const url = new URL('/apps/my-app/route?tab=settings', 'https://example.com');
    stripQueryParams(url);
    expect(url.pathname).toBe('/apps/my-app/route');
    expect(url.search).toBe('');
  });
});
