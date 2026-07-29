// Stored as a Promise so concurrent callers await the same registration
// and the plugin is never registered twice.
let pluginRegistrationPromise: Promise<void> | null = null;

/**
 * Lazily registers the Azure Identity cache persistence plugin on first use.
 *
 * Deferred to avoid loading `keytar` (a native C++ addon) at import time,
 * which would fail in CI environments where the prebuilt binary is unavailable
 * (e.g. `ERR_DLOPEN_FAILED`). Concurrent callers share the same Promise so
 * the plugin is registered exactly once even under parallel invocation.
 *
 * @throws {Error} When `@azure/identity-cache-persistence` cannot be loaded (e.g. the
 *   native keytar/libsecret module is unavailable in the current environment).
 */
export function ensureCachePersistencePlugin(): Promise<void> {
  pluginRegistrationPromise ??= (async () => {
    const { useIdentityPlugin } = await import('@azure/identity');
    let cachePersistencePlugin: Parameters<typeof useIdentityPlugin>[0];
    try {
      ({ cachePersistencePlugin } = await import('@azure/identity-cache-persistence'));
    } catch (cause) {
      pluginRegistrationPromise = null; // allow retry after transient failures
      throw new Error(
        'Failed to load @azure/identity-cache-persistence. ' +
          'Token cache persistence requires a native module (keytar/libsecret) that is only ' +
          'available in interactive desktop environments. Install the optional dependency or ' +
          'use a non-caching auth mode.',
        { cause },
      );
    }
    useIdentityPlugin(cachePersistencePlugin);
  })();
  return pluginRegistrationPromise;
}
