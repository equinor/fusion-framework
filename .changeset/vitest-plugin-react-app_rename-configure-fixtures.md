---
"@equinor/fusion-framework-vitest-plugin-react-app": major
---

Rename the `testApp`/`test` fixtures for extending the mocked application and parent framework
configuration: `configure` is now `configureApp`, the new `configureFramework` fixture
introduced alongside it is now `configureFusion`, and `env` is now `appEnv`.

```diff
-const test = testApp.extend('configure', { injected: true }, () => ...);
+const test = testApp.extend('configureApp', { injected: true }, () => ...);

-test.override('fusion', async ({ env }) => ...);
+test.override('fusion', async ({ appEnv }) => ...);
```

`configureFusion` composes with the base parent-framework mock (app manifest and navigation) the same way `configureApp` composes with the base app-module mock — see [Advanced usage](docs/advanced.md#extend-the-parent-framework-mock-with-configurefusion) for extending framework-scope modules such as feature flags, service discovery, or navigation history.

Also adds `mergeEnvConfig`, a new utility exported from the `/test` entry point for overriding one endpoint's URL (or an `environment` value) on `appEnv` without dropping the rest of the app's `AppConfig` — a plain object spread over `AppConfig` copies nothing, since it stores `environment`/`endpoints` behind private fields exposed only through getters. See [Advanced usage](docs/advanced.md#fake-an-endpoint-url-with-mergeenvconfig).

```ts
const test = baseTest.extend('appEnv', ({ appEnv }) =>
  mergeEnvConfig(appEnv, { endpoints: { 'cpr-api': { url: backendBaseUrl } } }),
);
```

