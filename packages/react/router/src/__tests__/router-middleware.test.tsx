import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  createContext,
  Link,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from 'react-router';
import { MemoryHistory } from '@equinor/fusion-framework-module-navigation/lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Router } from '../Router.js';
import type { MiddlewareFunction, MiddlewareFunctionArgs } from '../middleware.js';
import type { ErrorElementProps, RouteObject } from '../types.js';
import { routes as dslRoutes } from './mocks/middleware/routes.js';
import { middlewareLog as dslLog } from './mocks/middleware/middleware-log.js';

// Fusion module lookup is mocked so the Router can be rendered without a full Fusion app.
const modules = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModules: () => modules.current,
}));

// React requires this flag for `act` to work outside of a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Error component that prints the message of the error that reached the boundary. */
const Boundary = ({ error }: ErrorElementProps) => (
  <p>boundary:{error instanceof Error ? error.message : String(error)}</p>
);

/** Renders the loader data of the current route as text. */
const DataPage = () => <p>{String(useLoaderData())}</p>;

/**
 * Creates a middleware that records its before and after phases around `next()`.
 *
 * @param log - Shared execution log.
 * @param name - Label written to the log.
 * @returns Middleware that wraps the downstream chain.
 */
const timing =
  (log: string[], name: string): MiddlewareFunction =>
  async (_args, next) => {
    log.push(`${name}:before`);
    const result = await next();
    log.push(`${name}:after`);
    return result;
  };

/**
 * Creates a guard that always rejects the execution.
 *
 * @param log - Shared execution log.
 * @param name - Label written to the log and used as error message.
 * @returns Middleware that throws before calling `next()`.
 */
const deny =
  (log: string[], name: string): MiddlewareFunction =>
  () => {
    log.push(`${name}:deny`);
    throw new Error(name);
  };

/** Promise with externally controlled resolution, used to hold middleware mid-flight. */
const deferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('Router route middleware (React Router v8 client Data Mode)', () => {
  let container: HTMLDivElement;
  let root: Root;
  let history: MemoryHistory;
  let log: string[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    history = new MemoryHistory();
    modules.current = { navigation: { history, basename: '' } };
    log = [];
    dslLog.length = 0;
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    history[Symbol.dispose]();
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
   * Renders the router with `path` as the initial history entry and waits for the first non-empty render.
   *
   * The history is recreated so the router performs an initial load of `path` rather than a navigation.
   */
  const render = (routes: Parameters<typeof Router>[0]['routes'], path = '/', context = {}) => {
    const url = new URL(path, 'http://localhost');
    // A fresh history starts with a POP action; the `Action` enum is only exported as a type.
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
    modules.current = { navigation: { history, basename: '' } };
    return settle(
      () => expect(container.textContent).not.toBe(''),
      () => root.render(<Router routes={routes} context={context} />),
    );
  };

  const click = (selector: string) => () => container.querySelector<HTMLElement>(selector)?.click();

  it('runs parent before child and declaration order, then unwinds in reverse', async () => {
    await render(
      [
        {
          path: '/',
          middleware: [timing(log, 'root-1'), timing(log, 'root-2')],
          Component: Outlet,
          children: [
            {
              path: 'projects/:projectId',
              middleware: [timing(log, 'child')],
              loader: () => {
                log.push('loader');
                return 'project';
              },
              Component: DataPage,
            },
          ],
        },
      ],
      '/projects/p1',
    );

    expect(container.textContent).toBe('project');
    expect(log).toEqual([
      'root-1:before',
      'root-2:before',
      'child:before',
      'loader',
      'child:after',
      'root-2:after',
      'root-1:after',
    ]);
  });

  it('passes typed request, params, cancellation and Fusion context', async () => {
    const seen: MiddlewareFunctionArgs<{ projectId?: string }>[] = [];
    const record: MiddlewareFunction<{ projectId?: string }> = (args) => {
      seen.push(args);
    };
    await render(
      [{ path: '/projects/:projectId', middleware: [record], Component: () => <p>page</p> }],
      '/projects/p1',
      { tenant: 'equinor' },
    );

    expect(seen).toHaveLength(1);
    const [args] = seen;
    expect(args.params.projectId).toBe('p1');
    expect(args.request).toBeInstanceOf(Request);
    expect(new URL(args.request.url).pathname).toBe('/projects/p1');
    expect(args.signal).toBe(args.request.signal);
    expect(args.pattern).toBe('/projects/:projectId');
    expect(args.fusion.context).toEqual({ tenant: 'equinor' });
    expect(args.fusion.modules).toBe(modules.current);
  });

  it('continues the chain when a middleware returns without calling next()', async () => {
    await render([
      {
        path: '/',
        middleware: [
          () => {
            log.push('observer');
          },
          timing(log, 'inner'),
        ],
        loader: () => {
          log.push('loader');
          return 'ok';
        },
        Component: DataPage,
      },
    ]);

    expect(container.textContent).toBe('ok');
    expect(log).toEqual(['observer', 'inner:before', 'loader', 'inner:after']);
  });

  it('blocks every matched loader when a parent guard rejects the initial navigation', async () => {
    const parentLoader = vi.fn(() => 'parent');
    const childLoader = vi.fn(() => 'child');
    const ChildPage = vi.fn(() => <p>protected</p>);
    await render(
      [
        {
          path: '/',
          middleware: [deny(log, 'parent denied'), timing(log, 'parent-after-guard')],
          loader: parentLoader,
          errorElement: Boundary,
          Component: Outlet,
          children: [
            {
              path: 'reports',
              middleware: [timing(log, 'child')],
              loader: childLoader,
              Component: ChildPage,
            },
          ],
        },
      ],
      '/reports',
    );

    expect(container.textContent).toBe('boundary:parent denied');
    expect(log).toEqual(['parent denied:deny']);
    expect(parentLoader).not.toHaveBeenCalled();
    expect(childLoader).not.toHaveBeenCalled();
    expect(ChildPage).not.toHaveBeenCalled();
  });

  it('guards component-only routes on client navigation', async () => {
    const Secret = vi.fn(() => <p>secret</p>);
    await render([
      {
        path: '/',
        errorElement: Boundary,
        Component: Outlet,
        children: [
          { index: true, Component: () => <Link to="/secret">home</Link> },
          { path: 'secret', middleware: [deny(log, 'secret denied')], Component: Secret },
        ],
      },
    ]);
    expect(container.textContent).toBe('home');

    await settle(() => expect(container.textContent).toBe('boundary:secret denied'), click('a'));
    expect(Secret).not.toHaveBeenCalled();
  });

  it('runs layout middleware again when navigating between children of a mounted layout', async () => {
    const layoutLoader = vi.fn(() => 'layout');
    const Layout = () => (
      <>
        <Link to="/a">to-a</Link>
        <Link to="/b">to-b</Link>
        <Outlet />
      </>
    );
    await render(
      [
        {
          path: '/',
          middleware: [timing(log, 'layout')],
          loader: layoutLoader,
          Component: Layout,
          children: [
            { path: 'a', middleware: [timing(log, 'a')], Component: () => <p>page-a</p> },
            { path: 'b', middleware: [timing(log, 'b')], Component: () => <p>page-b</p> },
          ],
        },
      ],
      '/a',
    );
    expect(container.textContent).toContain('page-a');
    log.length = 0;

    await settle(() => expect(container.textContent).toContain('page-b'), click('a[href$="/b"]'));
    expect(log).toEqual(['layout:before', 'b:before', 'b:after', 'layout:after']);
    // The layout loader does not revalidate on a sibling navigation, but its middleware runs.
    expect(layoutLoader).toHaveBeenCalledTimes(1);
  });

  it('follows redirects thrown by middleware without running protected loaders', async () => {
    const protectedLoader = vi.fn(() => 'protected');
    await render(
      [
        {
          path: '/admin',
          middleware: [
            () => {
              throw redirect('/login');
            },
          ],
          loader: protectedLoader,
          Component: DataPage,
        },
        { path: '/login', Component: () => <p>login</p> },
      ],
      '/admin',
    );

    expect(container.textContent).toBe('login');
    expect(history.location.pathname).toBe('/login');
    expect(protectedLoader).not.toHaveBeenCalled();
  });

  it('routes errors thrown after next() to the nearest error boundary', async () => {
    await render(
      [
        {
          path: '/',
          errorElement: Boundary,
          Component: Outlet,
          children: [
            {
              path: 'page',
              middleware: [
                async (_args, next) => {
                  await next();
                  throw new Error('after failed');
                },
              ],
              loader: () => 'data',
              errorElement: Boundary,
              Component: DataPage,
            },
          ],
        },
      ],
      '/page',
    );

    expect(container.textContent).toBe('boundary:after failed');
  });

  it('runs middleware for fetcher loads, fetcher submissions and action revalidation', async () => {
    const methods: string[] = [];
    const recordMethod: MiddlewareFunction = ({ request }) => {
      methods.push(request.method);
    };
    const itemsLoader = vi.fn(() => 'items');
    const itemsAction = vi.fn(() => 'saved');
    const Page = () => {
      // Separate fetchers: a submitting fetcher holds action data, while a loaded fetcher is
      // revalidated by React Router after actions and on explicit revalidation.
      const reader = useFetcher();
      const writer = useFetcher();
      const revalidator = useRevalidator();
      return (
        <>
          <button id="load" type="button" onClick={() => reader.load('/items')}>
            load
          </button>
          <button
            id="submit"
            type="button"
            onClick={() => writer.submit({ name: 'x' }, { method: 'post', action: '/items' })}
          >
            submit
          </button>
          <button id="revalidate" type="button" onClick={() => revalidator.revalidate()}>
            revalidate
          </button>
          <p id="reader">{String(reader.data ?? 'idle')}</p>
          <p id="writer">{String(writer.data ?? 'idle')}</p>
        </>
      );
    };
    await render([
      { path: '/', Component: Page },
      { path: '/items', middleware: [recordMethod], loader: itemsLoader, action: itemsAction },
    ]);
    expect(methods).toEqual([]);

    await settle(
      () => expect(container.querySelector('#reader')?.textContent).toBe('items'),
      click('#load'),
    );
    expect(methods).toEqual(['GET']);

    await settle(
      () => expect(container.querySelector('#writer')?.textContent).toBe('saved'),
      click('#submit'),
    );
    expect(itemsAction).toHaveBeenCalledTimes(1);
    // The submission runs the chain, then the loaded fetcher revalidates through it again.
    await vi.waitFor(() => expect(methods).toEqual(['GET', 'POST', 'GET']));

    await act(async () => click('#revalidate')());
    await vi.waitFor(() => expect(methods).toEqual(['GET', 'POST', 'GET', 'GET']));
    expect(itemsLoader).toHaveBeenCalledTimes(3);
  });

  it('blocks actions when the middleware chain rejects a submission', async () => {
    const itemsAction = vi.fn(() => 'saved');
    const denyWrites: MiddlewareFunction = ({ request }) => {
      // Only mutations are denied, so the page itself still renders.
      if (request.method !== 'GET') throw new Error('writes denied');
    };
    const Page = () => {
      const fetcher = useFetcher();
      return (
        <button
          type="button"
          onClick={() => fetcher.submit({ name: 'x' }, { method: 'post', action: '/' })}
        >
          submit
        </button>
      );
    };
    await render([
      {
        path: '/',
        middleware: [denyWrites],
        action: itemsAction,
        errorElement: Boundary,
        Component: Page,
      },
    ]);

    await settle(
      () => expect(container.textContent).toBe('boundary:writes denied'),
      click('button'),
    );
    expect(itemsAction).not.toHaveBeenCalled();
  });

  it('aborts cancelled executions without committing late results', async () => {
    const gate = deferred();
    let slowSignal: AbortSignal | undefined;
    const slowLoader = vi.fn(() => 'slow');
    const SlowPage = vi.fn(() => <p>slow</p>);
    const Home = () => {
      const navigate = useNavigate();
      return (
        <>
          <button id="slow" type="button" onClick={() => navigate('/slow')}>
            slow
          </button>
          <button id="fast" type="button" onClick={() => navigate('/fast')}>
            fast
          </button>
        </>
      );
    };
    await render([
      { path: '/', Component: Home },
      {
        path: '/slow',
        middleware: [
          async ({ signal }, next) => {
            slowSignal = signal;
            await gate.promise;
            return next();
          },
        ],
        loader: slowLoader,
        Component: SlowPage,
      },
      { path: '/fast', Component: () => <p>fast</p> },
    ]);

    await act(async () => click('#slow')());
    await vi.waitFor(() => expect(slowSignal).toBeDefined());
    await settle(() => expect(container.textContent).toBe('fast'), click('#fast'));
    expect(slowSignal?.aborted).toBe(true);

    // Releasing the held middleware must not run the loader or render the cancelled route.
    await act(async () => gate.resolve());
    await act(async () => {});
    expect(slowLoader).not.toHaveBeenCalled();
    expect(SlowPage).not.toHaveBeenCalled();
    expect(container.textContent).toBe('fast');
    expect(history.location.pathname).toBe('/fast');
  });

  it('isolates typed router context values between executions', async () => {
    const userContext = createContext<string>('anonymous');
    const identify: MiddlewareFunction = ({ request, context }) => {
      const user = new URL(request.url).searchParams.get('user');
      // Only set the value when the request names a user, so leakage would be visible.
      if (user) context.set(userContext, user);
    };
    const Page = () => (
      <>
        <p id="user">{String(useLoaderData())}</p>
        <Link to="/">plain</Link>
      </>
    );
    await render(
      [
        {
          path: '/',
          middleware: [identify],
          loader: ({ context }) => context.get(userContext),
          Component: Page,
        },
      ],
      '/?user=alice',
    );
    expect(container.querySelector('#user')?.textContent).toBe('alice');

    await settle(
      () => expect(container.querySelector('#user')?.textContent).toBe('anonymous'),
      click('a'),
    );
  });

  describe('lazy route boundaries', () => {
    const lazyRoutes = (guard: MiddlewareFunction) => {
      const protectedLoader = vi.fn(() => {
        log.push('loader');
        return 'lazy-data';
      });
      const lazy = {
        middleware: vi.fn(async () => [timing(log, 'lazy-outer'), guard]),
        loader: vi.fn(async () => protectedLoader),
        Component: vi.fn(async () => DataPage),
      };
      const unrelatedComponent = vi.fn(async () => () => <p>unrelated</p>);
      const routes: RouteObject[] = [
        { path: '/', Component: () => <Link to="/guarded">home</Link> },
        // Static Fusion errorElement next to lazy properties: re-mapping must keep it renderable.
        { path: '/guarded', lazy, errorElement: Boundary },
        { path: '/unrelated', lazy: { Component: unrelatedComponent } },
      ];
      return { routes, lazy, protectedLoader, unrelatedComponent };
    };

    it('loads matched lazy middleware and runs it before the lazy loader', async () => {
      const { routes, lazy, protectedLoader, unrelatedComponent } = lazyRoutes(
        timing(log, 'lazy-guard'),
      );
      await render(routes);

      await settle(() => expect(container.textContent).toBe('lazy-data'), click('a'));
      expect(lazy.middleware).toHaveBeenCalledTimes(1);
      expect(protectedLoader).toHaveBeenCalledTimes(1);
      expect(log).toEqual([
        'lazy-outer:before',
        'lazy-guard:before',
        'loader',
        'lazy-guard:after',
        'lazy-outer:after',
      ]);
      expect(unrelatedComponent).not.toHaveBeenCalled();
    });

    it('never executes the lazy protected loader when lazy middleware rejects', async () => {
      const { routes, protectedLoader, unrelatedComponent } = lazyRoutes(deny(log, 'lazy denied'));
      await render(routes);

      await settle(() => expect(container.textContent).toBe('boundary:lazy denied'), click('a'));
      expect(protectedLoader).not.toHaveBeenCalled();
      expect(unrelatedComponent).not.toHaveBeenCalled();
    });
  });

  describe('explicit DSL route modules compiled by the Vite plugin', () => {
    it('runs route-module middleware exports in layout-to-page order', async () => {
      await render(dslRoutes, '/reports');

      expect(container.textContent).toBe('reports-data');
      expect(dslLog).toEqual([
        'layout:before',
        'reports:before',
        'reports:loader',
        'reports:after',
        'layout:after',
      ]);
    });

    it('stops at a route-module guard before its loader and renders the layout boundary', async () => {
      await render(dslRoutes, '/reports?deny');

      expect(container.textContent).toBe('layout-error:reports denied');
      // React Router turns the guard's error into a boundary result, so the layout's `next()`
      // resolves and its after phase still runs; the protected loader never does.
      expect(dslLog).toEqual(['layout:before', 'reports:before', 'layout:after']);
    });

    it('runs the layout chain for component-only route modules', async () => {
      await render(dslRoutes, '/open');

      expect(container.textContent).toBe('open');
      expect(dslLog).toEqual(['layout:before', 'layout:after']);
    });
  });
});
