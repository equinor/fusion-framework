---
"@equinor/fusion-framework-module-app": minor
---

Add `MockAppClient`, exported from a new `./mock` subpath, so a test can serve one app's own manifest and config locally instead of contacting the app service.

```ts
import { MockAppClient } from '@equinor/fusion-framework-module-app/mock';

enableAppModule(configurator, (builder) => {
  builder.setClient(async ({ requireInstance }) => {
    const http = await requireInstance('http');
    return new MockAppClient(http.createClient('apps'), manifest, config);
  });
});
```

`getAppManifest` only resolves locally for `manifest.appKey` with no `tag` at all. `getAppConfig` resolves for `manifest.appKey` when `tag` is either absent or equal to the manifest's own `build.version` — the same tag `App` requests when loading config for the manifest it already resolved. Every other request — other app keys, tagged requests, builds, settings — still goes through the real `AppClient` it wraps, so pointing service discovery at a different registry or a real local mock server keeps working unchanged.

Also export `AppConfig` as a value from the package root (previously type-only), so a test can construct one directly with `new AppConfig({ environment, endpoints })`.
