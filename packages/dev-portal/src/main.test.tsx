import { act, type PropsWithChildren } from 'react';
import ReactDOM, { type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render } from './main';

vi.mock('./configure', () => ({ configure: vi.fn() }));
vi.mock('./EquinorLoader', () => ({ EquinorLoader: () => null }));
vi.mock('@equinor/fusion-framework-react', () => ({
  Framework: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@equinor/fusion-framework-react-components-people-provider', () => ({
  PeopleResolverProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('./Router', () => ({
  Router: () =>
    createPortal(
      <input aria-label="Body portal control" data-testid="body-portal-control" />,
      document.body,
    ),
}));

let root: Root | undefined;
let target: HTMLElement;
let originalScheme: string | null;
let originalStyle: string | null;

beforeEach(() => {
  originalScheme = document.documentElement.getAttribute('data-color-scheme');
  originalStyle = document.documentElement.getAttribute('style');
  target = document.createElement('div');
  document.body.append(target);
  const createRoot = ReactDOM.createRoot;
  vi.spyOn(ReactDOM, 'createRoot').mockImplementation((element, options) => {
    expect(element.ownerDocument?.documentElement.dataset.colorScheme).toBe('light');
    root = createRoot(element, options);
    return root;
  });
});

afterEach(async () => {
  await act(() => root?.unmount());
  target.remove();
  // Isolate tests without suggesting a teardown contract for the document-owning shell.
  for (const [name, value] of [
    ['data-color-scheme', originalScheme],
    ['style', originalStyle],
  ] as const) {
    // Restore absent attributes as absent, not as empty values.
    if (value === null) {
      document.documentElement.removeAttribute(name);
    } else {
      document.documentElement.setAttribute(name, value);
    }
  }
  vi.restoreAllMocks();
});

describe('dev portal document palette', () => {
  it.each([undefined, 'dark', 'light'])(
    'locks a custom host with initial scheme %s before React mounts',
    async (scheme) => {
      // Exercise both explicit host themes and the automatic/default host state.
      if (scheme) {
        document.documentElement.dataset.colorScheme = scheme;
      } else {
        document.documentElement.removeAttribute('data-color-scheme');
      }
      document.documentElement.style.removeProperty('color-scheme');

      await act(() => render(target, { ref: { dispose: vi.fn() } }));

      const input = document.querySelector<HTMLInputElement>('[data-testid="body-portal-control"]');
      expect(input).not.toBeNull();
      expect(input?.parentElement).toBe(document.body);
      expect(getComputedStyle(input ?? document.body).colorScheme).toBe('light only');
      expect(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--eds-color-bg-floating')
          .trim(),
      ).toBe('#fff');
    },
  );
});
