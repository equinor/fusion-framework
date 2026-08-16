# @equinor/fusion-framework

> Bootstrap and configure the core Fusion Framework module graph — authentication, HTTP, service discovery, context, telemetry, and more — in a single initialization call.

## What is this package?

`@equinor/fusion-framework` is the top-level entry point for starting a Fusion Framework instance. It bundles the built-in module set (MSAL auth, HTTP client factory, service discovery, services, context, event bus, and telemetry) behind a single `FrameworkConfigurator` / `init` API so consumers do not have to wire each module individually.

**Use this package when** you are building a portal shell, a standalone application host, or any runtime that needs the full Fusion module stack. Micro-frontend applications that run _inside_ an already-initialized portal typically use `@equinor/fusion-framework-react-app` instead.

## Quick start

```typescript
import { FrameworkConfigurator, init } from '@equinor/fusion-framework';

// 1. Create a configurator
const configurator = new FrameworkConfigurator();

// 2. Set up authentication (MSAL)
configurator.configureMsal({
  clientId: '<your-client-id>',
  authority: 'https://login.microsoftonline.com/<your-tenant-id>',
});

// 3. Point service discovery at your registry
configurator.configureServiceDiscovery({
  client: { baseUri: 'https://service-registry.example.com' },
});

// 4. Bootstrap — resolves all modules and assigns window.Fusion
const fusion = await init(configurator);
console.log(fusion.modules); // fully initialized module instances
```

## Key concepts

| Concept | Description |
|---|---|
| **FrameworkConfigurator** | Collects configuration for every module before initialization. Provides typed helpers such as `configureMsal`, `configureHttp`, `configureHttpClient`, and `configureServiceDiscovery`. |
| **init** | Async function that takes a `FrameworkConfigurator`, initializes all modules, sets `window.Fusion`, and dispatches the `onFrameworkLoaded` event. |
| **FusionModules** | Type alias describing every built-in module descriptor (context, event, HTTP, MSAL, services, service-discovery, telemetry) plus any additional custom modules. |
| **Fusion** | The root runtime object returned by `init`. Contains the `modules` map with all live module instances. |

## API surface

| Export | Kind | Purpose |
|---|---|---|
| `FrameworkConfigurator` | class | Configure modules before initialization |
| `FusionConfigurator` | alias | _Deprecated_ — use `FrameworkConfigurator` |
| `init` / `default` | function | Bootstrap the framework from a configurator |
| `FusionModules` | type | Built-in + custom module descriptor union |
| `FusionModulesInstance` | type | Resolved instance map after initialization |
| `Fusion` | interface | Root object exposed on `window.Fusion` |
| `FusionRenderFn` | type | Callback signature for mounting an application into a DOM element |

## Common patterns

### Configure a named HTTP client

```typescript
configurator.configureHttpClient('my-api', {
  baseUri: 'https://api.example.com',
  defaultHeaders: { 'X-Custom': 'value' },
});
```

### Optional authentication

```typescript
// Pass `false` as second argument to make auth optional
configurator.configureMsal(msalConfig, false);
```

### Extend with custom modules

```typescript
import { FrameworkConfigurator, init } from '@equinor/fusion-framework';
import myCustomModule from './my-custom-module';

const configurator = new FrameworkConfigurator<[typeof myCustomModule]>();
configurator.addConfig({ module: myCustomModule, configure: (b) => { /* … */ } });
const fusion = await init(configurator);
```

## Built-in modules

The framework ships with the following modules enabled by default:

- **`@equinor/fusion-framework-module-event`** — cross-module event bus
- **`@equinor/fusion-framework-module-msal`** — MSAL / Azure AD authentication
- **`@equinor/fusion-framework-module-http`** — HTTP client factory and named clients
- **`@equinor/fusion-framework-module-service-discovery`** — runtime service endpoint resolution
- **`@equinor/fusion-framework-module-services`** — typed service clients
- **`@equinor/fusion-framework-module-context`** — application / project context selection
- **`@equinor/fusion-framework-module-telemetry`** — telemetry, logging, and metadata

## Testing

Import from `@equinor/fusion-framework/mock` to initialize the framework in a test without credentials, without network access and without configuration.

```typescript
import { mockFramework } from '@equinor/fusion-framework/mock';

const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
});

const token = await fusion.modules.auth.acquireAccessToken();
const apps = await fusion.modules.serviceDiscovery.resolveService('apps');
```

The **real** configure → initialize pipeline runs with the **real** built-in modules; only the boundaries that leave the process — the MSAL client and the service discovery client — are substituted. Module wiring, configuration validation and lifecycle hooks therefore behave as they do in production, so a test still catches wiring mistakes.

The entry point has **no test-runner dependency**, and ships no mocking API of its own — spying on an individual call is your test runner's job.

## Documentation

| Guide | Covers |
| --- | --- |
| [Choosing a testing layer](./docs/testing-choosing-a-layer.md) | Which import to use for React app, framework, module, HTTP, and runner-level tests |
| [Testing](./docs/testing.md) | Choosing the user, signed-out tests, composing the service registry, spying, and configuring as an application does |
| [Testing — design](./docs/testing-design.md) | What is substituted and why, where mocks live, determinism, and test-runner support |
| [Testing — adding a mock for another module](./docs/testing-extending.md) | Giving your own module a test double, and which framework modules are not covered yet |
| [Testing — API](./docs/testing-api.md) | Every mock export and the package that owns it |

## Further reading

📚 [Full documentation](https://equinor.github.io/fusion-framework/)

