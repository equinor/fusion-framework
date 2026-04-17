import { describe, it, expect } from 'vitest';

import {
  splitRelativePath,
  writeContextIdToQueryParam,
  readContextIdFromQueryParam,
  writeContextIdToAppPath,
  readContextIdFromAppPath,
  resolveContextIdFromUrl,
  buildContextUrlForStrategy,
  isBarAppRouteWithoutContext,
  appendContextToAppRoute,
  CONTEXT_QUERY_PARAM_KEY,
} from '../utils/url-utils';

describe('url-utils', () => {
  describe('CONTEXT_QUERY_PARAM_KEY', () => {
    it('should be $contextId', () => {
      expect(CONTEXT_QUERY_PARAM_KEY).toBe('$contextId');
    });
  });

  describe('splitRelativePath', () => {
    it('splits pathname only', () => {
      expect(splitRelativePath('/apps/foo')).toEqual({
        pathname: '/apps/foo',
        search: '',
        hash: '',
      });
    });

    it('splits pathname + search', () => {
      expect(splitRelativePath('/apps/foo?bar=1')).toEqual({
        pathname: '/apps/foo',
        search: 'bar=1',
        hash: '',
      });
    });

    it('splits pathname + search + hash', () => {
      expect(splitRelativePath('/apps/foo?bar=1#section')).toEqual({
        pathname: '/apps/foo',
        search: 'bar=1',
        hash: 'section',
      });
    });

    it('handles hash without search', () => {
      expect(splitRelativePath('/apps/foo#section')).toEqual({
        pathname: '/apps/foo',
        search: '',
        hash: 'section',
      });
    });
  });

  describe('writeContextIdToQueryParam', () => {
    it('adds $contextId to path without search', () => {
      const result = writeContextIdToQueryParam('/apps/foo', 'ctx-abc');
      expect(result).toBe('/apps/foo?$contextId=ctx-abc');
    });

    it('adds $contextId to path with existing params', () => {
      const result = writeContextIdToQueryParam('/apps/foo?view=list', 'ctx-abc');
      expect(result).toContain('$contextId=ctx-abc');
      expect(result).toContain('view=list');
    });

    it('removes $contextId when contextId is undefined', () => {
      const result = writeContextIdToQueryParam('/apps/foo?$contextId=old', undefined);
      expect(result).toBe('/apps/foo');
    });

    it('preserves hash', () => {
      const result = writeContextIdToQueryParam('/apps/foo#section', 'ctx-abc');
      expect(result).toBe('/apps/foo?$contextId=ctx-abc#section');
    });
  });

  describe('readContextIdFromQueryParam', () => {
    it('reads $contextId from search string', () => {
      expect(readContextIdFromQueryParam('/apps/foo?$contextId=ctx-abc')).toBe('ctx-abc');
    });

    it('returns undefined when no $contextId', () => {
      expect(readContextIdFromQueryParam('/apps/foo?view=list')).toBeUndefined();
    });

    it('returns undefined for empty path', () => {
      expect(readContextIdFromQueryParam('')).toBeUndefined();
    });
  });

  describe('writeContextIdToAppPath', () => {
    it('embeds context id as 3rd segment', () => {
      expect(writeContextIdToAppPath('/apps/my-app', 'ctx-abc')).toBe('/apps/my-app/ctx-abc');
    });

    it('strips context when undefined', () => {
      expect(writeContextIdToAppPath('/apps/my-app/old-ctx', undefined)).toBe('/apps/my-app');
    });

    it('returns path unchanged when not an app route', () => {
      expect(writeContextIdToAppPath('/other/route', 'ctx-abc')).toBe('/other/route');
    });
  });

  describe('readContextIdFromAppPath', () => {
    it('reads 3rd path segment', () => {
      expect(readContextIdFromAppPath('/apps/my-app/ctx-abc')).toBe('ctx-abc');
    });

    it('returns undefined for bare app route', () => {
      expect(readContextIdFromAppPath('/apps/my-app')).toBeUndefined();
    });

    it('reads context with deeper sub-routes', () => {
      expect(readContextIdFromAppPath('/apps/my-app/ctx-abc/settings')).toBe('ctx-abc');
    });
  });

  describe('resolveContextIdFromUrl', () => {
    it('prefers query param over path segment', () => {
      expect(resolveContextIdFromUrl('/apps/my-app/path-ctx?$contextId=query-ctx')).toBe(
        'query-ctx',
      );
    });

    it('falls back to path segment', () => {
      expect(resolveContextIdFromUrl('/apps/my-app/path-ctx')).toBe('path-ctx');
    });

    it('returns undefined when neither present', () => {
      expect(resolveContextIdFromUrl('/apps/my-app')).toBeUndefined();
    });
  });

  describe('buildContextUrlForStrategy', () => {
    it('writes query param for query strategy', () => {
      const result = buildContextUrlForStrategy('ctx-abc', '/apps/my-app', 'query');
      expect(result).toBe('/apps/my-app?$contextId=ctx-abc');
    });

    it('writes path segment for path strategy', () => {
      const result = buildContextUrlForStrategy('ctx-abc', '/apps/my-app', 'path');
      expect(result).toBe('/apps/my-app/ctx-abc');
    });

    it('returns path unchanged for custom strategy', () => {
      const result = buildContextUrlForStrategy('ctx-abc', '/apps/my-app/custom-route', 'custom');
      expect(result).toBe('/apps/my-app/custom-route');
    });

    it('defaults to path strategy when undefined', () => {
      const result = buildContextUrlForStrategy('ctx-abc', '/apps/my-app', undefined);
      expect(result).toBe('/apps/my-app/ctx-abc');
    });
  });

  describe('isBarAppRouteWithoutContext', () => {
    it('returns true for /apps/my-app', () => {
      expect(isBarAppRouteWithoutContext('/apps/my-app')).toBe(true);
    });

    it('returns true for /apps/my-app/', () => {
      expect(isBarAppRouteWithoutContext('/apps/my-app/')).toBe(true);
    });

    it('returns false for /apps/my-app/ctx-abc', () => {
      expect(isBarAppRouteWithoutContext('/apps/my-app/ctx-abc')).toBe(false);
    });

    it('returns false for non-app routes', () => {
      expect(isBarAppRouteWithoutContext('/other/route')).toBe(false);
    });
  });

  describe('appendContextToAppRoute', () => {
    it('appends context id with trailing slash stripped', () => {
      expect(appendContextToAppRoute('/apps/my-app/', 'ctx-abc')).toBe('/apps/my-app/ctx-abc');
    });

    it('appends context id without trailing slash', () => {
      expect(appendContextToAppRoute('/apps/my-app', 'ctx-abc')).toBe('/apps/my-app/ctx-abc');
    });
  });
});
