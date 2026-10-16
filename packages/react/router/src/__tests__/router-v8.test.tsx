import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Link, useLoaderData, useNavigate } from 'react-router';
import {
  BrowserHistory,
  BrowserHistoryStack,
  MemoryHistory,
} from '@equinor/fusion-framework-module-navigation/lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Router } from '../Router.js';
import { useRouterContext } from '../useRouterContext.js';
import type { ErrorElementProps, LoaderFunction, RouteObject } from '../types.js';

type TestHistory = MemoryHistory | BrowserHistory;

// Fusion module lookup is mocked so the Router can be rendered without a full Fusion app.
const modules = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModules: () => modules.current,
}));

// React requires this flag for `act` to work outside of a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Route loaders are typed by React Router, which does not know about the injected `fusion` argument.
 * This is the single, deliberate bridge between the two argument shapes (same as `wrapLoader`).
 */
const fusionLoader = (loader: LoaderFunction) => loader as unknown as RouteObject['loader'];

describe.each([
  ['memory', () => new MemoryHistory(), true],
  // BrowserHistory.go() currently notifies POP listeners more than once (history-level behaviour
  // that does not depend on the React Router version), so POP loader counts are not asserted for it.
  ['browser', () => new BrowserHistory({ stack: BrowserHistoryStack }), false],
] as const)('Router on React Router v8 (%s history)', (_name, createHistory, popNotifiesOnce) => {
  let container: HTMLDivElement;
  let root: Root;
  let history: TestHistory;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    // The real Fusion navigation history, as produced by the navigation module.
    // Browser history shares window.location across tests, so start each test at the root.
    window.history.replaceState(null, '', '/');
    history = createHistory();
    modules.current = { navigation: { history, basename: '' } };
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

  const render = (routes: RouteObject[], context = {}) =>
    settle(
      () => expect(container.textContent).not.toBe(''),
      () => root.render(<Router routes={routes} context={context} />),
    );

  it('injects fusion context into loaders and renders loader data', async () => {
    const queryClient = { id: 'qc' };
    const Page = () => <p>{JSON.stringify(useLoaderData())}</p>;
    await render(
      [{ path: '/', loader: fusionLoader(({ fusion }) => fusion.context), Component: Page }],
      { queryClient },
    );
    expect(container.textContent).toBe(JSON.stringify({ queryClient }));
  });

  describe('history-driven navigation', () => {
    const Home = () => {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate('/next')}>
          home
        </button>
      );
    };

    const setup = async () => {
      const loader = vi.fn(() => 'next');
      const Next = () => <p>{String(useLoaderData())}</p>;
      await render([
        { path: '/', Component: Home },
        { path: '/next', loader, Component: Next },
      ]);
      return loader;
    };

    it('runs the target loader once for useNavigate and keeps back history', async () => {
      const loader = await setup();
      await settle(
        () => {
          expect(container.textContent).toBe('next');
          expect(history.location.pathname).toBe('/next');
        },
        () => container.querySelector('button')?.click(),
      );
      expect(loader).toHaveBeenCalledTimes(1);

      await settle(
        () => {
          expect(container.textContent).toBe('home');
          expect(history.location.pathname).toBe('/');
        },
        () => history.go(-1),
      );

      await settle(
        () => {
          expect(container.textContent).toBe('next');
          expect(history.location.pathname).toBe('/next');
        },
        () => history.go(1),
      );
      if (popNotifiesOnce) expect(loader).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates with a router Link', async () => {
    const loader = vi.fn(() => 'next');
    const Next = () => <p>{String(useLoaderData())}</p>;
    await render([
      { path: '/', Component: () => <Link to="/next">home</Link> },
      { path: '/next', loader, Component: Next },
    ]);
    await settle(
      () => expect(container.textContent).toBe('next'),
      () => container.querySelector('a')?.click(),
    );
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('renders ErrorBoundary components with the thrown error and fusion context', async () => {
    const Boundary = ({ error, fusion }: ErrorElementProps) => (
      <p>
        {error instanceof Error ? error.message : 'unknown'}:{JSON.stringify(fusion.context)}
      </p>
    );
    await render(
      [
        {
          path: '/',
          loader: () => {
            throw new Error('boom');
          },
          Component: () => <p>never</p>,
          // Fusion error components receive `error`/`fusion` props, unlike React Router's prop-less type.
          ErrorBoundary: Boundary as unknown as RouteObject['ErrorBoundary'],
        },
      ],
      { a: 'ctx' },
    );
    expect(container.textContent).toBe('boom:{"a":"ctx"}');
  });

  it('renders errorElement components without hasErrorBoundary', async () => {
    await render([
      {
        path: '/',
        loader: () => {
          throw new Error('legacy');
        },
        Component: () => <p>never</p>,
        errorElement: ({ error }) => <p>{error instanceof Error ? error.message : 'unknown'}</p>,
      },
    ]);
    expect(container.textContent).toBe('legacy');
  });

  it('exposes fusion context to components via useRouterContext', async () => {
    const Page = () => <p>{JSON.stringify(useRouterContext().context)}</p>;
    await render([{ path: '/', Component: Page }], { a: 1 });
    expect(container.textContent).toBe('{"a":1}');
  });
});
