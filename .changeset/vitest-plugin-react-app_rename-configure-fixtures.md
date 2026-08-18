---
"@equinor/fusion-framework-vitest-plugin-react-app": major
---

Rename the `testApp`/`test` fixtures for extending the mocked application and parent framework configuration: `configure` is now `configureApp`, and the new `configureFramework` fixture introduced alongside it is now `configureFusion`.

```diff
-const test = testApp.extend('configure', { injected: true }, () => ...);
+const test = testApp.extend('configureApp', { injected: true }, () => ...);
```

`configureFusion` composes with the base parent-framework mock (app manifest and navigation) the same way `configureApp` composes with the base app-module mock — see [Advanced usage](docs/advanced.md#extend-the-parent-framework-mock-with-configurefusion) for extending framework-scope modules such as feature flags, service discovery, or navigation history.
