import { expect, test } from 'vitest';

test.each([
  { hideDispose: false, fallback: false },
  { hideDispose: true, fallback: true },
])('renders the portal with fallback=$fallback', async ({ hideDispose, fallback }) => {
  // Use a fresh realm: the real bootstrap replaces document.body, and each variant must
  // evaluate its own modules rather than reusing the browser's module registry.
  const frame = document.createElement('iframe');
  frame.src = '/__bootstrap-test/frame';
  const ready = new Promise<void>((resolve) =>
    frame.addEventListener('load', () => resolve(), { once: true }),
  );
  try {
    document.body.append(frame);
    await ready;
    const realm: (Window & typeof globalThis) | null = frame.contentWindow;
    // The test needs an isolated browser realm to evaluate bootstrap from a clean module registry.
    if (!realm) throw new Error('Bootstrap test iframe has no window.');

    // Hide the disposal symbol in the iframe so the dispatcher must select the WebKit-safe branch.
    if (hideDispose) {
      const { Symbol: NativeSymbol } = realm;
      const symbolWithoutDispose = Object.setPrototypeOf(
        NativeSymbol.bind(undefined),
        NativeSymbol,
      );
      Object.defineProperty(symbolWithoutDispose, 'dispose', { value: undefined });
      Object.defineProperty(realm, 'Symbol', { value: symbolWithoutDispose });
    }

    expect(typeof realm.Symbol.dispose).toBe(hideDispose ? 'undefined' : 'symbol');
    const errors: string[] = [];
    realm.addEventListener('error', (event) => errors.push(event.message));
    realm.addEventListener('unhandledrejection', (event) =>
      // Include requested resources to identify which lazy chunk failed during bootstrap.
      errors.push(
        `${event.reason}: ${realm.performance
          .getEntriesByType('resource')
          .map((resource) => new URL(resource.name).pathname)
          .join(', ')}`,
      ),
    );

    const active = { postMessage: () => {} };
    Object.defineProperty(realm.navigator, 'serviceWorker', {
      value: {
        startMessages: () => {},
        addEventListener: () => {},
        register: async () => ({ waiting: null, installing: null }),
        ready: Promise.resolve({ active }),
        controller: active,
      },
    });

    const entry = realm.document.createElement('script');
    entry.type = 'module';
    entry.src = '/__bootstrap-dist/html/bootstrap.js';
    entry.addEventListener('error', () => errors.push(`Failed to load ${entry.src}`));
    realm.document.head.append(entry);

    await expect
      .poll(() => ({ text: realm.document.body.textContent, errors }), { timeout: 5_000 })
      .toEqual({ text: 'Test portal rendered', errors: [] });
    // Resource entries verify that only the selected branch was requested.
    const modules = realm.performance
      .getEntriesByType('resource')
      .map((resource) => new URL(resource.name).pathname);
    expect(modules).toContain('/__bootstrap-dist/html/bootstrap.js');
    // The fallback case must not load a parser-sensitive native chunk.
    expect(modules.some((path) => /\/bootstrap-webkit-fallback[-.]/.test(path))).toBe(fallback);
    // The native case must not load the compatibility fallback.
    expect(modules.some((path) => /\/bootstrap-[\w-]{8}\.js$/.test(path))).toBe(!fallback);
  } finally {
    frame.remove();
  }
});
