import { act, type Context, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Link, Outlet, useActionData, useFetcher, useLoaderData, useSubmit } from 'react-router';
import { MemoryHistory } from '@equinor/fusion-framework-module-navigation/lib';
import { type IRolesClient, RolesProvider } from '@equinor/fusion-framework-module-roles';
import { defer, from, type Observable, of, switchMap, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Router } from '../Router.js';
import { RequireRolesError } from '../RequireRolesError.js';
import type { RequireRolesFetcherRecovery } from '../RequireRolesFetcherRecovery.js';
import { useRequireRolesFetcherRecoveries } from '../useRequireRolesFetcherRecoveries.js';
import { RequireRolesRecovery } from '../RequireRolesRecovery.js';
import { requireRoles } from '../require-roles.js';
import type { ErrorElementProps, RouteObject } from '../types.js';
import {
  type RequireRolesRecoveryState,
  useRequireRolesRecovery,
} from '../useRequireRolesRecovery.js';

// Fusion module lookup is mocked per rendered tree, so several routers can run side by side.
const modules = vi.hoisted(() => ({
  context: undefined as unknown as Context<Record<string, unknown>>,
}));
vi.mock('@equinor/fusion-framework-react-module', async () => {
  const react = await import('react');
  modules.context = react.createContext<Record<string, unknown>>({});
  return { useModules: () => react.useContext(modules.context) };
});

// React requires this flag for `act` to work outside of a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ActiveAssignments = ReturnType<IRolesClient['getActiveAccessRoleAssignments']>;

/** Roles V2 service state behind the client double. */
interface RolesServiceState {
  /** Access-role names the account currently holds on the service. */
  granted: string[];
  /** Access role each claimable assignment id activates. */
  claimable: Record<string, string>;
  /** When set, active-assignment requests fail with this error. */
  failure?: unknown;
  /** When set, active-assignment requests wait for this promise before answering. */
  pending?: Promise<void>;
}

/**
 * Typed Roles V2 client double modelling the production client's read cache: reads are cached
 * until `refresh: true` or a successful activation, exactly like `RolesClient`.
 *
 * @param state - Mutable service state.
 * @returns Roles V2 client test double wrapped by the real `RolesProvider`.
 */
const createClient = (state: RolesServiceState): IRolesClient => {
  let cache: string[] | undefined;
  const read = (refresh: boolean): ActiveAssignments => {
    if (state.failure !== undefined) {
      return throwError(() => state.failure) as ActiveAssignments;
    }
    if (refresh || !cache) {
      cache = [...state.granted];
    }
    return of(
      cache.map((accessRoleName) => ({
        systemName: 'Reports',
        accessRoleName,
        assignmentType: 'Global',
      })),
    ) as ActiveAssignments;
  };
  const unused = (): Observable<never> => throwError(() => new Error('not used by route gates'));
  return {
    initialize: vi.fn(),
    getActiveAccessRoleAssignments: vi.fn((options?: { refresh?: boolean }) =>
      defer(() => {
        const refresh = options?.refresh === true;
        return state.pending
          ? from(state.pending).pipe(switchMap(() => read(refresh)))
          : read(refresh);
      }),
    ) as IRolesClient['getActiveAccessRoleAssignments'],
    getConsolidatedClaimableRoleAssignments: vi.fn(unused),
    getConsolidatedRoleAssignments: vi.fn(unused),
    activateClaimableRoleAssignment: vi.fn(({ assignmentId }) =>
      defer(() => {
        state.granted.push(state.claimable[assignmentId]);
        // Activation invalidates read caches in the production client.
        cache = undefined;
        return of({ id: assignmentId });
      }),
    ) as unknown as IRolesClient['activateClaimableRoleAssignment'],
    deactivateClaimableRoleAssignment: vi.fn(unused),
    hasClaimableRoleAssignmentForAccessRole: vi.fn(unused),
    getRequiredAccessRoleStatuses: vi.fn(unused),
    getAccessRoles: vi.fn(unused),
  } as IRolesClient;
};

/** Promise with externally controlled resolution. */
const deferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

/** Activation the existing recovery UI performs before calling `onRetry`. */
const activationInput = (assignmentId: string) => ({
  assignmentId,
  reason: 'Need access',
  hours: 1,
});

/** Mounted router instance under test. */
interface Instance {
  readonly container: HTMLDivElement;
  readonly root: Root;
  readonly history: MemoryHistory;
  /** Recovery controls rendered by the latest error element of this instance. */
  recovery?: RequireRolesRecoveryState;
  /** Error rendered by the latest error element of this instance. */
  error?: unknown;
  /** Pending fetcher holds rendered by the latest fetcher host of this instance. */
  holds?: readonly RequireRolesFetcherRecovery[];
}

describe('requireRoles recovery', () => {
  let instances: Instance[];
  let service: RolesServiceState;
  let client: IRolesClient;
  let provider: RolesProvider;
  let log: string[];

  beforeEach(() => {
    instances = [];
    service = { granted: [], claimable: { 'assignment-reports': 'Reports.Read' } };
    client = createClient(service);
    provider = new RolesProvider({ client });
    log = [];
  });

  afterEach(async () => {
    for (const instance of instances) {
      await act(async () => instance.root.unmount());
      instance.history[Symbol.dispose]();
      instance.container.remove();
    }
    provider.dispose();
  });

  /** Waits until the assertion holds, flushing React work in between. */
  const settle = async (assertion: () => void, action?: () => unknown) => {
    await act(async () => {
      await action?.();
    });
    await vi.waitFor(async () => {
      await act(async () => {});
      assertion();
    });
  };

  /**
   * Error element rendering the recovery the hook offers, as an app would compose it with
   * `RoleErrorView`.
   *
   * @param instance - Instance whose recovery is exposed to the test.
   * @returns Error element component.
   */
  const recoveryBoundary =
    (instance: () => Instance) =>
    ({ error }: ErrorElementProps) => {
      const recovery = useRequireRolesRecovery(error);
      const current = instance();
      current.recovery = recovery;
      current.error = error;
      const reason = RequireRolesError.is(error) ? error.reason : 'other';
      return (
        <p>
          error:{reason}:{recovery ? `${recovery.operation}:${recovery.status}` : 'none'}
          <Link to="/">leave</Link>
        </p>
      );
    };

  /**
   * Renders a Fusion `Router` in its own container and history.
   *
   * @param build - Builds routes for the instance; receives the instance error element.
   * @param path - Initial location.
   * @returns The mounted instance.
   */
  const mount = async (
    build: (
      ErrorElement: ReturnType<typeof recoveryBoundary>,
      instance: () => Instance,
    ) => RouteObject[],
    path = '/',
  ): Promise<Instance> => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const url = new URL(path, 'http://localhost');
    const history = new MemoryHistory({
      initialLocation: {
        delta: 0,
        action: 'POP' as never,
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
    const instance: Instance = { container, root: createRoot(container), history };
    instances.push(instance);
    const routes = build(
      recoveryBoundary(() => instance),
      () => instance,
    );
    const value = { navigation: { history, basename: '' }, roles: provider };
    await settle(
      () => expect(container.textContent).not.toBe(''),
      () =>
        instance.root.render(
          <modules.context.Provider value={value}>
            <Router routes={routes} />
          </modules.context.Provider>,
        ),
    );
    return instance;
  };

  /** Activates the claimable assignment through the real provider, then calls `onRetry`. */
  const activateAndRetry = async (instance: Instance) => {
    await act(async () => {
      await provider.activateClaimableRoleAssignment(activationInput('assignment-reports'));
      instance.recovery?.retry();
    });
  };

  /**
   * Protected `/reports` route with a loader, an action and a component recording when they run.
   *
   * @param ErrorElement - Root error element.
   * @returns Routes.
   */
  const reportsRoutes = (ErrorElement: ReturnType<typeof recoveryBoundary>): RouteObject[] => [
    {
      path: '/',
      errorElement: ErrorElement,
      Component: () => (
        <>
          <Link to="/reports">go</Link>
          <Outlet />
        </>
      ),
      children: [
        {
          index: true,
          Component: () => {
            const submit = useSubmit();
            return (
              <button
                type="button"
                onClick={() => submit({ value: 'x' }, { method: 'post', action: '/reports' })}
              >
                home
              </button>
            );
          },
        },
        {
          path: 'reports',
          middleware: [requireRoles(['Reports.Read'])],
          loader: () => {
            log.push('loader');
            return 'reports-data';
          },
          action: async ({ request }) => {
            const body = await request.formData();
            log.push(`action:${String(body.get('value'))}`);
            return 'saved';
          },
          Component: () => {
            const data = useLoaderData() as string;
            const actionData = useActionData() as string | undefined;
            log.push('render');
            return (
              <p>
                {data}:{actionData ?? 'no-action'}
              </p>
            );
          },
        },
      ],
    },
  ];

  it('retries a denied navigation only after activation and a fresh refresh check', async () => {
    const instance = await mount(reportsRoutes, '/reports');
    expect(instance.container.textContent).toContain('error:denied:navigation:idle');
    expect(log).toEqual([]);

    // A retry without activation re-checks with refresh and reports the unchanged denial.
    await settle(
      () => expect(instance.container.textContent).toContain('navigation:still-denied'),
      () => instance.recovery?.retry(),
    );
    expect(log).toEqual([]);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenLastCalledWith({ refresh: true });

    await activateAndRetry(instance);
    await settle(() => expect(instance.container.textContent).toContain('reports-data:no-action'));
    expect(log.filter((entry) => entry === 'loader')).toEqual(['loader']);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledWith({ refresh: true });
  });

  it('observes the activation only through refresh when the client cache is stale', async () => {
    const instance = await mount(reportsRoutes, '/reports');
    // Grant out of band: the cached read still denies, so only `refresh: true` can observe it.
    service.granted.push('Reports.Read');
    expect(await provider.hasAccessRole(['Reports.Read'], { required: true })).toBe(false);

    await settle(
      () => expect(instance.container.textContent).toContain('reports-data'),
      () => instance.recovery?.retry(),
    );
    expect(log.filter((entry) => entry === 'loader')).toEqual(['loader']);
  });

  it('recovers a component-only child behind a passing parent gate (AND nesting)', async () => {
    service.granted = ['App.Access'];
    const instance = await mount(
      (ErrorElement) => [
        {
          path: '/',
          middleware: [requireRoles(['App.Access'])],
          errorElement: ErrorElement,
          Component: () => <Outlet />,
          children: [
            {
              path: 'reports',
              middleware: [requireRoles(['Reports.Read'])],
              Component: () => {
                log.push('render');
                return <p>component-only</p>;
              },
            },
          ],
        },
      ],
      '/reports',
    );
    expect(instance.container.textContent).toContain('error:denied:navigation:idle');
    expect(log).toEqual([]);
    const denial = instance.error as RequireRolesError;
    expect(denial.requirement.roles).toEqual(['Reports.Read']);

    await activateAndRetry(instance);
    await settle(() => expect(instance.container.textContent).toBe('component-only'));
    // The parent gate still runs on the retried execution; it was not bypassed.
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalled();
  });

  it('keeps a still-denied parent gate in force when only the child role was activated', async () => {
    const instance = await mount(
      (ErrorElement) => [
        {
          path: '/',
          errorElement: ErrorElement,
          Component: () => <Outlet />,
          children: [
            {
              path: 'app',
              middleware: [requireRoles(['App.Access'])],
              Component: () => <Outlet />,
              children: [
                {
                  path: 'reports',
                  middleware: [requireRoles(['Reports.Read'])],
                  Component: () => <p>child</p>,
                },
              ],
            },
          ],
        },
      ],
      '/app/reports',
    );
    // The parent gate denies first; the child requirement cannot weaken it.
    expect((instance.error as RequireRolesError).requirement.roles).toEqual(['App.Access']);

    await activateAndRetry(instance);
    // Activating the child's role does not satisfy the parent's requirement: nothing is replayed.
    await settle(() =>
      expect(instance.container.textContent).toContain('error:denied:navigation:still-denied'),
    );
  });

  it('replays a denied form submission exactly once after activation', async () => {
    const instance = await mount(reportsRoutes, '/');
    await settle(
      () => expect(instance.container.textContent).toContain('error:denied:submission:idle'),
      () => instance.container.querySelector('button')?.click(),
    );
    expect(log).toEqual([]);
    const recovery = RequireRolesRecovery.from(instance.error);

    await act(async () => {
      await provider.activateClaimableRoleAssignment(activationInput('assignment-reports'));
      // A double click on the recovery button shares one attempt.
      instance.recovery?.retry();
      instance.recovery?.retry();
    });
    await settle(() => expect(instance.container.textContent).toContain('reports-data:saved'));
    expect(log.filter((entry) => entry.startsWith('action'))).toEqual(['action:x']);
    expect(instance.history.location.pathname).toBe('/reports');

    // The recovery is spent: a late retry reports the outcome without submitting again.
    expect(await recovery?.retry()).toBe('retried');
    expect(log.filter((entry) => entry.startsWith('action'))).toEqual(['action:x']);
  });

  /** Text of the element with the given test id, or `null` when it is not rendered. */
  const text = (instance: Instance, id: string): string | null =>
    instance.container.querySelector(`[data-testid="${id}"]`)?.textContent ?? null;

  /** Clicks the element with the given test id. */
  const click = (instance: Instance, id: string): void =>
    instance.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)?.click();

  /**
   * Fetcher-recovery host as an app layout renders it next to the existing Roles recovery UI.
   *
   * @param props - Instance receiving the pending holds.
   * @returns Summary of the pending holds.
   */
  const FetcherHost = ({ instance }: { readonly instance: () => Instance }) => {
    const holds = useRequireRolesFetcherRecoveries();
    instance().holds = holds;
    return (
      <span data-testid="holds">
        {holds.map((hold) => `${hold.operation}:${hold.status}`).join(',')}
      </span>
    );
  };

  /**
   * Second consumer of an explicitly keyed fetcher.
   *
   * @param props - Shared fetcher key.
   * @returns Fetcher state and data.
   */
  const Peer = ({ fetcherKey }: { readonly fetcherKey: string }) => {
    const fetcher = useFetcher({ key: fetcherKey });
    return (
      <span data-testid="peer">
        {fetcher.state}:{String(fetcher.data ?? '')}
      </span>
    );
  };

  /**
   * Routes with a fetcher owner on the index route and a protected `/api` resource route.
   *
   * @param options - Explicit fetcher key, and whether the layout mounts a fetcher host.
   * @returns Route builder for {@link mount}.
   */
  const fetcherRoutes =
    ({ key, host = true }: { readonly key?: string; readonly host?: boolean } = {}) =>
    (
      ErrorElement: ReturnType<typeof recoveryBoundary>,
      instance: () => Instance,
    ): RouteObject[] => [
      {
        path: '/',
        errorElement: ErrorElement,
        Component: () => {
          const [showHost, setShowHost] = useState(host);
          return (
            <>
              {showHost ? <FetcherHost instance={instance} /> : null}
              <button type="button" data-testid="hide-host" onClick={() => setShowHost(false)}>
                hide
              </button>
              <Link to="/other" data-testid="other">
                other
              </Link>
              <Outlet />
            </>
          );
        },
        children: [
          {
            index: true,
            loader: () => {
              log.push('home:loader');
              return 'home';
            },
            Component: () => {
              const fetcher = useFetcher(key === undefined ? undefined : { key });
              useEffect(() => {
                log.push('owner:mount');
              }, []);
              const submit = (value: string) =>
                fetcher.submit({ value }, { method: 'post', action: '/api' });
              return (
                <>
                  <span data-testid="owner">
                    {fetcher.state}:{String(fetcher.data ?? '')}
                  </span>
                  <button type="button" data-testid="load" onClick={() => fetcher.load('/api')}>
                    load
                  </button>
                  <button type="button" data-testid="submit" onClick={() => submit('f')}>
                    submit
                  </button>
                  <button type="button" data-testid="submit-g" onClick={() => submit('g')}>
                    submit-g
                  </button>
                  {key === undefined ? null : <Peer fetcherKey={key} />}
                </>
              );
            },
          },
          { path: 'other', Component: () => <p data-testid="other-page">other-page</p> },
          {
            path: 'api',
            middleware: [requireRoles(['Reports.Read'])],
            loader: () => {
              log.push('api:loader');
              return 'api-data';
            },
            action: async ({ request }) => {
              const value = String((await request.formData()).get('value'));
              log.push(`action:${value}`);
              return `saved:${value}`;
            },
          },
        ],
      },
    ];

  /** Activates the claimable assignment through the real provider, then retries the first hold. */
  const activateAndResume = async (instance: Instance) => {
    await act(async () => {
      await provider.activateClaimableRoleAssignment(activationInput('assignment-reports'));
      void instance.holds?.[0]?.retry();
    });
  };

  /** Log entries starting with the prefix. */
  const entries = (prefix: string): string[] => log.filter((entry) => entry.startsWith(prefix));

  describe('fetcher executions', () => {
    it('holds a denied unkeyed fetcher load and delivers its data to the same consumer', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-load:waiting'),
        () => click(instance, 'load'),
      );
      // The owner stays mounted and loading; no error boundary replaced it.
      expect(text(instance, 'owner')).toBe('loading:');
      expect(instance.container.textContent).not.toContain('error:');

      // Without activation the fresh check still denies; the execution stays held.
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-load:still-denied'),
        () => instance.holds?.[0]?.retry(),
      );
      expect(entries('api:')).toEqual([]);
      expect(client.getActiveAccessRoleAssignments).toHaveBeenLastCalledWith({ refresh: true });

      await activateAndResume(instance);
      await settle(() => expect(text(instance, 'owner')).toBe('idle:api-data'));
      expect(text(instance, 'holds')).toBe('');
      expect(entries('api:')).toEqual(['api:loader']);
      // The data reached the original consumer: it never remounted.
      expect(entries('owner:')).toEqual(['owner:mount']);
    });

    it('resumes a denied unkeyed fetcher submission once and delivers the action result', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      expect(text(instance, 'owner')).toBe('submitting:');
      const homeLoadsBefore = entries('home:').length;
      const [hold] = instance.holds ?? [];

      await act(async () => {
        await provider.activateClaimableRoleAssignment(activationInput('assignment-reports'));
        // A double click on the recovery button shares one attempt.
        void hold?.retry();
        void hold?.retry();
      });
      await settle(() => expect(text(instance, 'owner')).toBe('idle:saved:f'));
      expect(entries('action:')).toEqual(['action:f']);
      // React Router's normal post-action revalidation ran for the resumed submission.
      expect(entries('home:')).toHaveLength(homeLoadsBefore + 1);
      expect(entries('owner:')).toEqual(['owner:mount']);

      // The hold is spent: a late retry never submits again.
      expect(await hold?.retry()).toBe('stale');
      expect(entries('action:')).toEqual(['action:f']);
    });

    it('delivers recovered results to every consumer of an explicitly keyed fetcher', async () => {
      const instance = await mount(fetcherRoutes({ key: 'report' }));
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      expect(text(instance, 'peer')).toBe('submitting:');
      expect(instance.holds?.[0]?.key).toBe('report');

      await activateAndResume(instance);
      await settle(() => expect(text(instance, 'peer')).toBe('idle:saved:f'));
      expect(text(instance, 'owner')).toBe('idle:saved:f');
      expect(entries('action:')).toEqual(['action:f']);

      // Access now holds: a keyed load passes straight through without a hold.
      await settle(
        () => expect(text(instance, 'peer')).toBe('idle:api-data'),
        () => click(instance, 'load'),
      );
      expect(entries('owner:')).toEqual(['owner:mount']);
    });

    it('keeps the execution held when the fresh check fails, then resumes after recovery', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      service.failure = new Error('network down');
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:check-failed'),
        () => instance.holds?.[0]?.retry(),
      );
      expect(text(instance, 'owner')).toBe('submitting:');
      expect(entries('action:')).toEqual([]);

      service.failure = undefined;
      await activateAndResume(instance);
      await settle(() => expect(text(instance, 'owner')).toBe('idle:saved:f'));
      expect(entries('action:')).toEqual(['action:f']);
    });

    it('shows the denial explicitly when the user dismisses the hold', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      const [hold] = instance.holds ?? [];
      await settle(
        () => expect(instance.container.textContent).toContain('error:denied:none'),
        () => hold?.dismiss(),
      );
      expect(RequireRolesError.is(instance.error)).toBe(true);
      service.granted.push('Reports.Read');
      expect(await hold?.retry()).toBe('stale');
      expect(entries('action:')).toEqual([]);
    });

    it('cancels a hold superseded by a resubmission of the same fetcher', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      const [first] = instance.holds ?? [];
      // React Router aborts the first execution; only the second one stays held.
      await settle(
        () => expect(instance.holds?.[0]).not.toBe(first),
        () => click(instance, 'submit-g'),
      );
      expect(text(instance, 'holds')).toBe('fetcher-submission:waiting');
      expect(first?.pending).toBe(false);

      await activateAndResume(instance);
      await settle(() => expect(text(instance, 'owner')).toBe('idle:saved:g'));
      expect(entries('action:')).toEqual(['action:g']);
      expect(await first?.retry()).toBe('stale');
      expect(entries('action:')).toEqual(['action:g']);
    });

    it('ends held loads and submissions without running them when their owner route is left', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(instance, 'submit'),
      );
      const [submission] = instance.holds ?? [];
      await settle(
        () => expect(text(instance, 'other-page')).toBe('other-page'),
        () => click(instance, 'other'),
      );
      await settle(() => expect(text(instance, 'holds')).toBe(''));
      // The owner is gone, so the denial is discarded, never shown on the new page.
      expect(instance.container.textContent).not.toContain('error:');
      service.granted.push('Reports.Read');
      expect(await submission?.retry()).toBe('stale');
      expect(entries('action:')).toEqual([]);
    });

    it('ends held executions when the last host unmounts or the router is disposed', async () => {
      const instance = await mount(fetcherRoutes());
      await settle(
        () => expect(text(instance, 'holds')).toBe('fetcher-load:waiting'),
        () => click(instance, 'load'),
      );
      const [load] = instance.holds ?? [];
      // Nobody can show the hold any more: it fails explicitly at the owner's boundary.
      await settle(
        () => expect(instance.container.textContent).toContain('error:denied:none'),
        () => click(instance, 'hide-host'),
      );
      expect(load?.pending).toBe(false);

      const second = await mount(fetcherRoutes());
      await settle(
        () => expect(text(second, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(second, 'submit'),
      );
      const [submission] = second.holds ?? [];
      await act(async () => second.root.unmount());
      expect(submission?.pending).toBe(false);
      service.granted.push('Reports.Read');
      expect(await submission?.retry()).toBe('stale');
      expect(entries('action:')).toEqual([]);
      expect(entries('api:')).toEqual([]);
    });

    it('fails denied fetcher executions explicitly when no host is mounted', async () => {
      const instance = await mount(fetcherRoutes({ host: false }));
      await settle(
        () => expect(instance.container.textContent).toContain('error:denied:none'),
        () => click(instance, 'load'),
      );
      // No recovery is offered that could not deliver the result to the owner.
      expect(RequireRolesRecovery.from(instance.error)).toBeUndefined();
      expect(entries('api:')).toEqual([]);
    });

    it('isolates fetcher holds between router instances', async () => {
      const first = await mount(fetcherRoutes());
      const second = await mount(fetcherRoutes());
      await settle(
        () => expect(text(first, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(first, 'submit'),
      );
      await settle(
        () => expect(text(second, 'holds')).toBe('fetcher-submission:waiting'),
        () => click(second, 'submit-g'),
      );
      expect(first.holds).toHaveLength(1);
      expect(second.holds).toHaveLength(1);

      await activateAndResume(first);
      await settle(() => expect(text(first, 'owner')).toBe('idle:saved:f'));
      // The second router's execution stays held until its own recovery runs.
      expect(text(second, 'holds')).toBe('fetcher-submission:waiting');
      expect(entries('action:')).toEqual(['action:f']);

      await act(async () => second.holds?.[0]?.retry());
      await settle(() => expect(text(second, 'owner')).toBe('idle:saved:g'));
      expect(entries('action:')).toEqual(['action:f', 'action:g']);
    });
  });

  it('reports check-failed without retrying and allows a later retry', async () => {
    const instance = await mount(reportsRoutes, '/reports');
    service.failure = new Error('network down');
    await settle(
      () => expect(instance.container.textContent).toContain('navigation:check-failed'),
      () => instance.recovery?.retry(),
    );
    expect(log).toEqual([]);

    service.failure = undefined;
    await activateAndRetry(instance);
    await settle(() => expect(instance.container.textContent).toContain('reports-data'));
  });

  it('cancels a pending retry when the user navigates away, without replaying', async () => {
    const instance = await mount(reportsRoutes, '/reports');
    const recovery = RequireRolesRecovery.from(instance.error);
    const gate = deferred();
    service.pending = gate.promise;
    await act(async () => instance.recovery?.retry());

    // Leaving unmounts the error element, which aborts its retry.
    await settle(
      () => expect(instance.container.textContent).toBe('gohome'),
      () =>
        [...instance.container.querySelectorAll('a')]
          .find((anchor) => anchor.textContent === 'leave')
          ?.click(),
    );
    service.pending = undefined;
    service.granted.push('Reports.Read');
    gate.resolve();
    await settle(() => expect(instance.history.location.pathname).toBe('/'));
    expect(log).toEqual([]);

    // A direct retry of the left denial is stale: the router no longer shows it.
    expect(await recovery?.retry()).toBe('stale');
    expect(log).toEqual([]);
    expect(instance.container.textContent).toBe('gohome');
  });

  it('does not replay into a disposed router', async () => {
    const instance = await mount(reportsRoutes, '/reports');
    const recovery = RequireRolesRecovery.from(instance.error);
    service.granted.push('Reports.Read');
    await act(async () => instance.root.unmount());

    expect(await recovery?.retry()).toBe('stale');
    expect(log).toEqual([]);
  });

  it('isolates recoveries between router instances', async () => {
    const first = await mount(reportsRoutes, '/reports');
    const second = await mount(reportsRoutes, '/reports');
    expect(RequireRolesRecovery.from(first.error)?.router).not.toBe(
      RequireRolesRecovery.from(second.error)?.router,
    );

    await activateAndRetry(first);
    await settle(() => expect(first.container.textContent).toContain('reports-data'));
    // The second router keeps its own denial until its own recovery runs.
    expect(second.container.textContent).toContain('error:denied:navigation:idle');
    expect(log.filter((entry) => entry === 'loader')).toEqual(['loader']);
  });

  it('offers no recovery for check failures, missing configuration or other errors', async () => {
    service.failure = new Error('network down');
    const failed = await mount(reportsRoutes, '/reports');
    expect(failed.container.textContent).toContain('error:check-failed:none');
    expect(RequireRolesRecovery.from(failed.error)).toBeUndefined();
    expect(RequireRolesRecovery.from(new Error('other'))).toBeUndefined();
    expect(RequireRolesRecovery.from('text')).toBeUndefined();
  });
});
