# Test Fusion React apps

Fusion Framework uses Vitest for application tests. Vitest shares Vite's module and
configuration model, runs components in a real browser, and owns the test runner, assertions,
fixtures, spies, coverage, and editor integration. Fusion provides only the application scope
and deterministic platform boundaries needed to test production behavior.

Use `@equinor/fusion-framework-vitest-plugin-react-app` when a React hook, component, route,
or complete app consumes Fusion modules. The package resolves app files, initializes the real
framework and app provider nesting, and substitutes supported external clients without
introducing a second testing language.

## Choose the subject

| Subject | Start with | What the test proves |
| --- | --- | --- |
| Pure function or framework-independent hook | Standard Vitest | Local behavior without a Fusion runtime |
| Hook that consumes Fusion app modules | `renderAppHook` | Hook behavior inside an initialized app scope |
| Component that consumes Fusion app modules | `/test` `render` fixture or `renderAppComponent` | Rendered behavior with real providers |
| Route or complete application | `/test` `test` and `render` | App configuration, navigation, loaders, and module lifecycle together |
| Framework or module integration without React | Package `/mock` entry points | Production provider behavior with external boundaries substituted |

Prefer the smallest layer containing the behavior under assertion. A component test should
not recreate a portal, while an app lifecycle test should not replace every Fusion hook with
a JavaScript module mock.

## Start here

Follow [Getting started](getting-started.md) to install the browser dependencies, configure
Vitest, and run one deterministic app test without credentials, a portal, or backend services.

## Continue by task

- [Configure Vitest defaults and non-standard app files](configuration.md)
- [Compose fixtures and explicit render options](advanced.md)
- [Seed Fusion module dependencies](module-mocks.md)
- [Troubleshoot browser, app-resolution, and network failures](troubleshooting.md)
- [Choose between app, framework, module, and HTTP testing](../../../framework/docs/testing-choosing-a-layer.md)

Use the official Vitest documentation for generic runner concepts:

- [Why Vitest](https://vitest.dev/guide/why)
- [Writing tests](https://vitest.dev/guide/learn/writing-tests)
- [Browser Mode](https://vitest.dev/guide/browser/)
- [Test context and fixtures](https://vitest.dev/guide/test-context)
- [Configuration](https://vitest.dev/config/)
- [Mocking](https://vitest.dev/guide/mocking)
