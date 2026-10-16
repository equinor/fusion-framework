import { describe, expect, it } from 'vitest';

import {
  getRouteMiddlewareMetadata,
  normalizeRolesRequirement,
  requireRolesStaticContract,
  routeMiddlewareMetadataKey,
} from '../middleware-metadata/index.js';
import type { MiddlewareFunction } from '../middleware.js';
import { requireRoles } from '../require-roles.js';

describe('requireRoles declaration and metadata', () => {
  it('defaults to mode all and exposes inspectable route-local metadata', () => {
    expect(getRouteMiddlewareMetadata(requireRoles(['Reports.Read']))).toEqual({
      kind: 'roles',
      mode: 'all',
      roles: ['Reports.Read'],
    });
  });

  it('accepts mode any and keeps declaration order', () => {
    expect(
      getRouteMiddlewareMetadata(requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })),
    ).toEqual({ kind: 'roles', mode: 'any', roles: ['Reports.Read', 'Reports.Admin'] });
  });

  it('trims and deduplicates names but keeps exact case', () => {
    expect(
      normalizeRolesRequirement([
        ' Reports.Read ',
        'Reports.Read',
        'reports.read',
        'Reports.Read  ',
      ]),
    ).toEqual({ kind: 'roles', mode: 'all', roles: ['Reports.Read', 'reports.read'] });
  });

  it('rejects an empty array', () => {
    expect(() => requireRoles([])).toThrow(
      new TypeError(
        'requireRoles: at least one access-role name is required. Remove the middleware instead of passing an empty array.',
      ),
    );
  });

  it.each([[''], ['   '], ['Reports.Read', '\t']])('rejects blank names in %j', (...roles) => {
    expect(() => requireRoles(roles)).toThrow(/requireRoles: role at index \d is blank/);
  });

  it('rejects non-string names and non-array input from untyped callers', () => {
    expect(() => normalizeRolesRequirement(['Reports.Read', 42])).toThrow(
      'requireRoles: role at index 1 must be a string access-role name, received 42.',
    );
    expect(() => normalizeRolesRequirement('Reports.Read')).toThrow(
      'requireRoles: expected an array of Roles V2 access-role names, received "Reports.Read".',
    );
  });

  it.each([['ALL'], ['some'], [''], [null], [1]])('rejects unsupported mode %j', (mode) => {
    expect(() => normalizeRolesRequirement(['Reports.Read'], { mode })).toThrow(
      /requireRoles: unsupported mode .*Use 'all' \(every role, the default\) or 'any'/,
    );
  });

  it('rejects non-object options', () => {
    expect(() => normalizeRolesRequirement(['Reports.Read'], 'any')).toThrow(
      `requireRoles: options must be an object such as { mode: 'any' }, received "any".`,
    );
  });

  it('freezes metadata and keeps it out of enumeration', () => {
    const middleware = requireRoles(['Reports.Read']);
    const metadata = getRouteMiddlewareMetadata(middleware);

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.kind === 'roles' ? metadata.roles : undefined)).toBe(true);
    expect(Object.keys(middleware)).toEqual([]);
    expect(JSON.stringify({ middleware: [middleware] })).toBe('{"middleware":[null]}');
    expect(() => {
      Object.defineProperty(middleware, routeMiddlewareMetadataKey, { value: undefined });
    }).toThrow(TypeError);
  });

  it('reports custom middleware as opaque', () => {
    const custom: MiddlewareFunction = () => undefined;

    expect(getRouteMiddlewareMetadata(custom)).toEqual({ kind: 'custom' });
    expect(getRouteMiddlewareMetadata(undefined)).toEqual({ kind: 'custom' });
  });

  it('re-validates metadata read from another bundle copy', () => {
    const foreign = Object.assign(() => undefined, {
      [routeMiddlewareMetadataKey]: { kind: 'roles', mode: 'any', roles: ['A', ' A '] },
    });
    const malformed = Object.assign(() => undefined, {
      [routeMiddlewareMetadataKey]: { kind: 'roles', mode: 'any', roles: [] },
    });
    const unknown = Object.assign(() => undefined, {
      [routeMiddlewareMetadataKey]: { kind: 'project' },
    });

    expect(getRouteMiddlewareMetadata(foreign)).toEqual({
      kind: 'roles',
      mode: 'any',
      roles: ['A'],
    });
    expect(() => getRouteMiddlewareMetadata(malformed)).toThrow(TypeError);
    expect(() => getRouteMiddlewareMetadata(unknown)).toThrow(/unrecognised metadata/);
  });

  it('uses a registered symbol so separate bundle copies share the key', () => {
    expect(routeMiddlewareMetadataKey).toBe(
      Symbol.for('@equinor/fusion-framework-react-router/middleware-metadata'),
    );
  });

  it('publishes the static recognition contract for build consumers', () => {
    expect(requireRolesStaticContract).toEqual({
      moduleSpecifier: '@equinor/fusion-framework-react-router',
      exportName: 'requireRoles',
      routeExportName: 'middleware',
      defaultMode: 'all',
      modes: ['all', 'any'],
    });
  });
});
