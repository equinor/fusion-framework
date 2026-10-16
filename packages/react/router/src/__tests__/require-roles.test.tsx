import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Link, Outlet, useFetcher, useSubmit } from 'react-router';
import { MemoryHistory } from '@equinor/fusion-framework-module-navigation/lib';
import {
  type IRolesClient,
  RolesError,
  RolesProvider,
} from '@equinor/fusion-framework-module-roles';
import { RequiredAccessRolesError } from '@equinor/fusion-framework-module-roles/errors';
import { defer, from, type Observable, of, switchMap, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Router } from '../Router.js';
import { RequireRolesError } from '../RequireRolesError.js';
import { getRouteMiddlewareMetadata } from '../middleware-metadata/index.js';
import { requireRoles } from '../require-roles.js';
import type { ErrorElementProps, RouteObject } from '../types.js';
import { routes as dslRoutes } from './mocks/require-roles/routes.js';
import { rolesLog } from './mocks/require-roles/roles-log.js';
import * as dslLayoutModule from './mocks/require-roles/RolesLayout.js';
import * as dslReportsModule from './mocks/require-roles/RolesReportsPage.js';

// Fusion module lookup is mocked so the Router can be rendered without a full Fusion app.
const modules = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModules: () => modules.current,
}));

// React requires this flag for `act` to work outside of a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ActiveAssignments = ReturnType<IRolesClient['getActiveAccessRoleAssignments']>;

/** Controls what the Roles V2 client test double answers for active access roles. */
interface RolesServiceState {
  /** Access-role names the account holds as global assignments. */
  granted: string[];
  /** When set, the next active-assignment requests fail with this error. */
  failure?: unknown;
  /** When set, active-assignment requests wait for this promise before answering. */
  pending?: Promise<void>;
}

/**
 * Creates a typed Roles V2 client double whose active assignments follow `state`.
 *
 * The real {@link RolesProvider} wraps it, so `hasAccessRole` semantics (all/any, exact names,
 * global assignments, assertion errors) are the production ones.
 *
 * @param state - Mutable service state read on every request.
 * @returns Roles V2 client test double.
 */
const createClient = (state: RolesServiceState): IRolesClient => {
  const answer = (): ActiveAssignments => {
    if (state.failure !== undefined) {
      return throwError(() => state.failure) as ActiveAssignments;
    }
    return of(
      state.granted.map((accessRoleName) => ({
        systemName: 'Reports',
        accessRoleName,
        assignmentType: 'Global',
      })),
    ) as ActiveAssignments;
  };
  const unused = (): Observable<never> => throwError(() => new Error('not used by route gates'));
  return {
    initialize: vi.fn(),
    getActiveAccessRoleAssignments: vi.fn(() =>
      defer(() => (state.pending ? from(state.pending).pipe(switchMap(() => answer())) : answer())),
    ) as IRolesClient['getActiveAccessRoleAssignments'],
    getConsolidatedClaimableRoleAssignments: vi.fn(unused),
    getConsolidatedRoleAssignments: vi.fn(unused),
    activateClaimableRoleAssignment: vi.fn(unused),
    deactivateClaimableRoleAssignment: vi.fn(unused),
    hasClaimableRoleAssignmentForAccessRole: vi.fn(unused),
    getRequiredAccessRoleStatuses: vi.fn(unused),
    getAccessRoles: vi.fn(unused),
  };
};

/** Error component that prints the reason, message and missing roles of a role-gate error. */
const Boundary = ({ error }: ErrorElementProps) => (
  <p>
    {RequireRolesError.is(error)
      ? `${error.reason}:${error.missingAccessRoles.join(',')}`
      : `other:${error instanceof Error ? error.message : String(error)}`}
  </p>
);

/** Promise with externally controlled resolution, used to hold the Roles service mid-flight. */
const deferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('requireRoles route middleware', () => {
  let container: HTMLDivElement;
  let root: Root;
  let history: MemoryHistory;
  let service: RolesServiceState;
  let client: IRolesClient;
  let provider: RolesProvider;
  let log: string[];
  let caught: unknown[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    history = new MemoryHistory();
    service = { granted: [] };
    client = createClient(service);
    provider = new RolesProvider({ client });
    log = [];
    caught = [];
    rolesLog.length = 0;
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    history[Symbol.dispose]();
    provider.dispose();
    container.remove();
  });

  /** Runs the action inside `act`, then waits until the assertion holds. */
  const settle = async (assertion: () => void, action?: () => void) => {
    await act(async () => {
      action?.();
    });
    await vi.waitFor(async () => {
      await act(async () => {});
      assertion();
    });
  };

  /**
   * Renders the router at `path` with the given Fusion modules and waits for the first render.
   *
   * @param routes - Routes to render.
   * @param path - Initial location.
   * @param withRoles - Whether the Roles module is enabled.
   */
  const render = (routes: Parameters<typeof Router>[0]['routes'], path = '/', withRoles = true) => {
    const url = new URL(path, 'http://localhost');
    const initialAction = history.action;
    history[Symbol.dispose]();
    history = new MemoryHistory({
      initialLocation: {
        delta: 0,
        action: initialAction,
        location: {
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          key: 'initial',
          state: null,
          unstable_mask: undefined,
        },
      },
    });
    const navigation = { history, basename: '' };
    modules.current = withRoles ? { navigation, roles: provider } : { navigation };
    return settle(
      () => expect(container.textContent).not.toBe(''),
      () => root.render(<Router routes={routes} />),
    );
  };

  /** Boundary that also records the caught error for structural assertions. */
  const RecordingBoundary = (props: ErrorElementProps) => {
    caught.push(props.error);
    return <Boundary {...props} />;
  };

  /**
   * Builds a single protected route with a loader and a component that record when they run.
   *
   * @param middleware - Middleware of the protected route.
   * @returns Route objects with a public home route and the protected `/reports` route.
   */
  const protectedRoutes = (middleware: RouteObject['middleware']): RouteObject[] => [
    {
      path: '/',
      errorElement: RecordingBoundary,
      Component: () => (
        <>
          <Link to="/reports">go</Link>
          <Outlet />
        </>
      ),
      children: [
        { index: true, Component: () => <p>home</p> },
        {
          path: 'reports',
          middleware,
          loader: () => {
            log.push('loader');
            return 'reports-data';
          },
          Component: () => {
            log.push('render');
            return <p>reports</p>;
          },
        },
      ],
    },
  ];

  it('continues when every required role is active (mode all is the default)', async () => {
    service.granted = ['Reports.Read', 'Reports.Export'];
    await render(protectedRoutes([requireRoles(['Reports.Read', 'Reports.Export'])]), '/reports');

    expect(container.textContent).toContain('reports');
    expect(log).toEqual(['loader', 'render']);
  });

  it('denies mode all when one role is missing, before the loader and component run', async () => {
    service.granted = ['Reports.Read'];
    await render(protectedRoutes([requireRoles(['Reports.Read', 'Reports.Export'])]), '/reports');

    expect(container.textContent).toBe('denied:Reports.Export');
    expect(log).toEqual([]);
    const [error] = caught;
    expect(RequireRolesError.is(error)).toBe(true);
    const denial = error as RequireRolesError;
    expect(denial.requirement).toEqual({
      kind: 'roles',
      mode: 'all',
      roles: ['Reports.Read', 'Reports.Export'],
    });
    // The provider's recovery error stays reachable for existing access-recovery UI.
    expect(RequiredAccessRolesError.is(denial.cause)).toBe(true);
    expect((denial.cause as RequiredAccessRolesError).provider).toBe(provider);
  });

  it('passes mode any with one active role and denies it with none', async () => {
    const routes = protectedRoutes([
      requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' }),
    ]);
    service.granted = ['Reports.Admin'];
    await render(routes, '/reports');
    expect(log).toEqual(['loader', 'render']);

    await act(async () => root.unmount());
    root = createRoot(container);
    log.length = 0;
    service.granted = ['Other.Role'];
    await render(routes, '/reports');
    expect(container.textContent).toBe('denied:Reports.Read,Reports.Admin');
    expect(log).toEqual([]);
  });

  it('matches role names exactly and case-sensitively', async () => {
    service.granted = ['reports.read'];
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/reports');

    expect(container.textContent).toBe('denied:Reports.Read');
    expect(log).toEqual([]);
  });

  it('protects component-only routes without loaders', async () => {
    service.granted = [];
    await render(
      [
        {
          path: '/',
          errorElement: Boundary,
          middleware: [requireRoles(['Reports.Read'])],
          Component: () => {
            log.push('render');
            return <p>component-only</p>;
          },
        },
      ],
      '/',
    );

    expect(container.textContent).toBe('denied:Reports.Read');
    expect(log).toEqual([]);
  });

  describe('nesting', () => {
    const nested = (childMode: 'all' | 'any'): RouteObject[] => [
      {
        path: '/',
        errorElement: Boundary,
        middleware: [requireRoles(['App.Access'])],
        Component: () => <Outlet />,
        children: [
          {
            path: 'reports',
            middleware: [requireRoles(['Reports.Read', 'App.Access'], { mode: childMode })],
            loader: () => {
              log.push('loader');
              return null;
            },
            Component: () => <p>reports</p>,
          },
        ],
      },
    ];

    it('composes parent and child requirements with AND', async () => {
      service.granted = ['App.Access'];
      await render(nested('all'), '/reports');

      expect(container.textContent).toBe('denied:Reports.Read');
      expect(log).toEqual([]);
    });

    it('does not let a weaker child requirement bypass the parent', async () => {
      // The child alone would pass with Reports.Read in mode any; the parent still denies.
      service.granted = ['Reports.Read'];
      await render(nested('any'), '/reports');

      expect(container.textContent).toBe('denied:App.Access');
      expect(log).toEqual([]);
    });

    it('runs the loader once both levels pass', async () => {
      service.granted = ['App.Access', 'Reports.Read'];
      await render(nested('all'), '/reports');

      expect(container.textContent).toBe('reports');
      expect(log).toEqual(['loader']);
    });

    it('enforces route-module middleware exports compiled by the Vite plugin', async () => {
      service.granted = ['Reports.Admin'];
      await render(dslRoutes, '/reports');
      expect(container.textContent).toBe(
        'roles-error:Access denied: this route requires all of the access roles App.Access.',
      );
      expect(rolesLog).toEqual([]);

      await act(async () => root.unmount());
      root = createRoot(container);
      service.granted = ['App.Access', 'Reports.Admin'];
      await render(dslRoutes, '/reports');
      expect(container.textContent).toBe('reports-data');
      expect(rolesLog).toEqual(['reports:loader']);
    });

    it('exposes the declared requirements of route-module exports as metadata', () => {
      expect(dslLayoutModule.middleware.map(getRouteMiddlewareMetadata)).toEqual([
        { kind: 'roles', mode: 'all', roles: ['App.Access'] },
      ]);
      expect(dslReportsModule.middleware.map(getRouteMiddlewareMetadata)).toEqual([
        { kind: 'roles', mode: 'any', roles: ['Reports.Read', 'Reports.Admin'] },
      ]);
    });
  });

  it('reports a missing Roles module as a configuration error, not a denial', async () => {
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/reports', false);

    expect(container.textContent).toBe('not-configured:');
    expect(log).toEqual([]);
    expect((caught[0] as Error).message).toContain('the Roles module is not configured');
  });

  it('reports a provider failure as check-failed, distinct from a denial', async () => {
    service.failure = new Error('roles service unavailable');
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/reports');

    expect(container.textContent).toBe('check-failed:');
    expect(log).toEqual([]);
    const error = caught[0] as RequireRolesError;
    // The real provider wraps transport failures as RolesError; it is kept, not turned into a denial.
    expect(RolesError.is(error.cause)).toBe(true);
    expect(RequiredAccessRolesError.is(error.cause)).toBe(false);
    expect((error.cause as RolesError).cause).toBe(service.failure);
    expect(error.missingAccessRoles).toEqual([]);
  });

  it('wraps provider-level RolesError failures as check-failed', async () => {
    const failure = new RolesError('Roles V2 response validation failed.');
    vi.spyOn(provider, 'hasAccessRole').mockRejectedValue(failure);
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/reports');

    expect(container.textContent).toBe('check-failed:');
    expect((caught[0] as RequireRolesError).cause).toBe(failure);
  });

  it('treats a non-asserting false answer as a denial, never as access', async () => {
    vi.spyOn(provider, 'hasAccessRole').mockResolvedValue(false);
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/reports');

    expect(container.textContent).toBe('denied:Reports.Read');
    expect(log).toEqual([]);
  });

  it('delegates the decision to hasAccessRole with the declared requirement', async () => {
    const check = vi.spyOn(provider, 'hasAccessRole');
    service.granted = ['Reports.Read'];
    await render(
      protectedRoutes([requireRoles([' Reports.Read ', 'Reports.Admin'], { mode: 'any' })]),
      '/reports',
    );

    expect(check).toHaveBeenCalledWith(['Reports.Read', 'Reports.Admin'], {
      required: false,
      assert: true,
    });
  });

  it('keeps the protected route pending while the check is in flight', async () => {
    const gate = deferred();
    service.pending = gate.promise;
    service.granted = ['Reports.Read'];
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/');
    expect(container.textContent).toBe('gohome');

    await act(async () => container.querySelector<HTMLElement>('a')?.click());
    await act(async () => {});
    expect(container.textContent).toBe('gohome');
    expect(log).toEqual([]);

    await settle(() => expect(container.textContent).toBe('goreports'), gate.resolve);
    expect(log).toEqual(['loader', 'render']);
  });

  it('discards a pending check when the user navigates elsewhere', async () => {
    const gate = deferred();
    service.pending = gate.promise;
    service.granted = ['Reports.Read'];
    await render(
      [
        {
          path: '/',
          errorElement: Boundary,
          Component: () => (
            <>
              <Link to="/reports">go</Link>
              <Link to="/">home</Link>
              <Outlet />
            </>
          ),
          children: [
            { index: true, Component: () => <p>index</p> },
            {
              path: 'reports',
              middleware: [requireRoles(['Reports.Read'])],
              loader: () => {
                log.push('loader');
                return null;
              },
              Component: () => <p>reports</p>,
            },
          ],
        },
      ],
      '/',
    );
    const links = container.querySelectorAll<HTMLElement>('a');
    await act(async () => links[0].click());
    await act(async () => links[1].click());
    await settle(() => expect(container.textContent).toBe('gohomeindex'), gate.resolve);
    await act(async () => {});

    expect(log).toEqual([]);
    expect(container.textContent).toBe('gohomeindex');
  });

  it('checks again on every middleware execution', async () => {
    service.granted = ['Reports.Read'];
    await render(protectedRoutes([requireRoles(['Reports.Read'])]), '/');
    const calls = vi.mocked(client.getActiveAccessRoleAssignments);
    // The home route has no role gate, so no check happens on the initial load.
    expect(calls).not.toHaveBeenCalled();

    await settle(
      () => expect(container.textContent).toBe('goreports'),
      () => container.querySelector<HTMLElement>('a')?.click(),
    );
    expect(calls).toHaveBeenCalledTimes(1);

    // Access removed between executions is enforced on the next one.
    service.granted = [];
    await settle(
      () => expect(container.textContent).toBe('denied:Reports.Read'),
      () => container.querySelector<HTMLElement>('a')?.click(),
    );
    expect(calls).toHaveBeenCalledTimes(2);
  });

  describe('fetchers and submissions', () => {
    const SubmitButton = () => {
      const submit = useSubmit();
      return (
        <button
          type="button"
          onClick={() => submit({ value: '1' }, { method: 'post', action: '/reports' })}
        >
          submit
        </button>
      );
    };

    const FetchButton = () => {
      const fetcher = useFetcher();
      return (
        <button type="button" onClick={() => fetcher.load('/reports')}>
          fetch:{String(fetcher.data ?? '')}
        </button>
      );
    };

    const actionRoutes = (): RouteObject[] => [
      {
        path: '/',
        errorElement: Boundary,
        Component: () => (
          <>
            <SubmitButton />
            <FetchButton />
            <Outlet />
          </>
        ),
        children: [
          {
            path: 'reports',
            middleware: [requireRoles(['Reports.Write'])],
            loader: () => {
              log.push('loader');
              return 'fetched';
            },
            action: () => {
              log.push('action');
              return null;
            },
          },
        ],
      },
    ];

    it('stops a denied submission before the action runs', async () => {
      service.granted = [];
      await render(actionRoutes(), '/');
      const [submit] = container.querySelectorAll<HTMLElement>('button');

      await settle(
        () => expect(container.textContent).toBe('denied:Reports.Write'),
        () => submit.click(),
      );
      expect(log).toEqual([]);
    });

    it('stops a denied fetcher load before the loader runs', async () => {
      service.granted = [];
      await render(actionRoutes(), '/');
      const [, fetch] = container.querySelectorAll<HTMLElement>('button');

      await settle(
        () => expect(container.textContent).toBe('denied:Reports.Write'),
        () => fetch.click(),
      );
      expect(log).toEqual([]);
    });

    it('lets an authorized fetcher load and submission through', async () => {
      service.granted = ['Reports.Write'];
      await render(actionRoutes(), '/');
      const [, fetch] = container.querySelectorAll<HTMLElement>('button');

      await settle(
        () => expect(container.textContent).toContain('fetch:fetched'),
        () => fetch.click(),
      );
      const [submit] = container.querySelectorAll<HTMLElement>('button');
      await settle(
        () => expect(log).toContain('action'),
        () => submit.click(),
      );
    });
  });
});
