import { afterEach, describe, expect, it, vi } from 'vitest';

import { installEdsColorScheme } from './install-eds-color-scheme';

const edsVariablesStyleId = 'fusion-dev-portal-eds-variables';

type ChangeListener = (event: MediaQueryListEvent) => void;

/** Creates a controllable `matchMedia` stub for the dark-scheme query. */
const stubMatchMedia = (matches: boolean) => {
  const listeners = new Set<ChangeListener>();
  const query = {
    matches,
    addEventListener: (_: string, listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_: string, listener: ChangeListener) => listeners.delete(listener),
  };
  // The stub implements only the members installEdsColorScheme uses.
  vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList);
  return {
    listeners,
    emit: (dark: boolean) => {
      // Notify every registered listener, like a real preference change.
      for (const listener of listeners) listener({ matches: dark } as MediaQueryListEvent);
    },
  };
};

describe('installEdsColorScheme', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById(edsVariablesStyleId)?.remove();
    delete document.documentElement.dataset.colorScheme;
  });

  it('injects the EDS variables stylesheet once', () => {
    stubMatchMedia(false);
    installEdsColorScheme()();
    installEdsColorScheme()();

    const styles = document.querySelectorAll(`#${edsVariablesStyleId}`);
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('--eds-color-bg-neutral-surface');
  });

  it('follows the system preference and its changes', () => {
    const media = stubMatchMedia(true);
    const cleanup = installEdsColorScheme();
    expect(document.documentElement.dataset.colorScheme).toBe('dark');

    media.emit(false);
    expect(document.documentElement.dataset.colorScheme).toBe('light');

    cleanup();
    expect(media.listeners.size).toBe(0);
  });

  it('resolves EDS colours for the active scheme', () => {
    const media = stubMatchMedia(false);
    installEdsColorScheme();
    const read = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--eds-color-bg-neutral-surface')
        .trim();
    const light = read();

    media.emit(true);
    expect(read()).not.toBe(light);
  });

  it.each(['light', 'dark'])(
    'paints the page with the EDS neutral surface in %s mode',
    (scheme) => {
      stubMatchMedia(scheme === 'dark');
      installEdsColorScheme()();

      // Resolve the token through a probe so the test follows the EDS value instead of a literal.
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--eds-color-bg-neutral-surface)';
      document.body.appendChild(probe);
      const surface = getComputedStyle(probe).backgroundColor;
      probe.remove();

      expect(surface).not.toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(document.body).backgroundColor).toBe(surface);
      expect(getComputedStyle(document.documentElement).backgroundColor).toBe(surface);
    },
  );
});
