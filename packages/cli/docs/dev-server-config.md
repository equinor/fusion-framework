# Configure `ffc app dev`

The dev server supports optional configuration through a `dev-server.config.ts` file in your
project root. Use it for SPA environment values, service-discovery endpoints, logging, and shared
mock-server defaults.

> [!IMPORTANT]
> Define mocked service behavior in `mocks/<service>.mock.ts` with `defineService`. Do not handwrite
> service mocks as `api.routes` or inject them with `api.processServices`; those are low-level
> extension points for server-owned behavior and discovery transformations.

> [!NOTE]
> Basic server options like `port`, `host`, and `open` are configured via CLI flags or Vite configuration, not through `dev-server.config.ts`.

## Why Configure the Dev Server?

The default dev-server configuration works for most applications, but you may want to customize it when:

- **Configuring mock discovery**: Set shared mock directory, host, port, or seed defaults
- **Debugging service discovery**: Filter or modify discovered services for testing
- **Customizing the development environment**: Adjust template variables, CLI logging, or browser console logging
- **Isolating development scenarios**: Configure different behaviors for different development stages

## Getting Started

Most applications need no `dev-server.config.ts`. To mock a backend, start with the
[mock-service guide](../../dev-server/docs/mocking.md) and create `mocks/<service>.mock.ts`.

Create `dev-server.config.ts` only when the application needs shared server settings. Start with
object configuration:

```typescript
export default {
  log: { level: 4 },
};
```

For conditional configuration based on environment or other runtime logic, use function configuration:

```typescript
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(({ base }) => {
  // Access to base config and environment for advanced logic
  const isDebug = process.env.DEBUG === 'true';

  return {
    log: { level: isDebug ? 4 : base.log?.level },
  };
});
```

> [!TIP]
> Start with object config. Use function config only when you need conditional logic or access to the base configuration.

## TypeScript Integration

For full TypeScript support and intellisense, import the configuration types:

```typescript
import { defineDevServerConfig, type DevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(({ base }): DevServerConfig => ({
  ...base,
  log: { level: 4 },
}));
```

The configuration object supports full TypeScript intellisense, including:
- Auto-completion for all configuration options
- Type checking for middleware functions
- Proper typing for service discovery responses

## Configuration Overview

The dev-server configuration supports these main areas:

| Area | Purpose | Common Use Cases |
|------|---------|------------------|
| `mockServer` | Shared mock-server defaults | Mock directory, host, port, deterministic seed |
| `api.routes` | Add server-owned endpoints | Health checks or infrastructure callbacks |
| `api.processServices` | Modify processed discovery | Advanced filtering or URI transformation |
| `api.serviceDiscoveryUrl` | Change discovery endpoint | Custom/dev environments |
| `spa.templateEnv` | Override Fusion config | Portal settings, MSAL config, telemetry |
| `log` | Control CLI logging verbosity | Debug dev-server issues, reduce terminal noise |

## How Configuration Works

The `dev-server.config.ts` file is designed for **overriding** the default dev-server behavior. You only specify what you want to change - the system automatically merges your overrides with the defaults.

### Object Configuration (Recommended)
Just export the properties you want to override:

```typescript
export default {
  spa: {
    templateEnv: {
      telemetry: { consoleLevel: 0 } // Only override telemetry
    }
  }
};
```

The dev-server automatically merges this with its default configuration.

### Function Configuration (Advanced)
Use functions when you need conditional logic or access to runtime values:

```typescript
export default defineDevServerConfig(({ base }) => {
  // You have access to base config and runtime environment
  return {
    log: { level: process.env.DEBUG === 'true' ? 4 : base.log?.level },
  };
});
```

**Key Point**: You don't need to manually spread/merge anything. Just provide the overrides you want - the merging happens automatically.

## Array Merging Behavior

The dev-server uses intelligent array merging:

- **Routes**: Merged by `match` path - routes with identical paths are replaced (yours wins)
- **Other arrays**: Deduplicated using `Set` - removes exact duplicates
- **Services**: In service discovery, arrays are typically replaced rather than merged

Example route merging:
```typescript
// Base config has:
routes: [{ match: '/api/users', middleware: baseHandler }]

// Your config has:
routes: [{ match: '/api/users', middleware: yourHandler }]

// Result: yourHandler replaces baseHandler for /api/users
```

## Quick Start Examples

### I Need To...
| I want to... | Configuration | Example |
|--------------|---------------|---------|
| Mock a service | `mocks/<service>.mock.ts` | Use `defineService` and run `ffc mock-server` |
| Configure mock defaults | `mockServer` | Set `path`, `host`, `port`, or `seed` |
| Transform real discovery | `api.processServices` | Advanced: filter or rewrite processed services |
| Override MSAL config | `spa.templateEnv.msal` | `msal: { clientId: 'dev-client-id' }` |
| Change telemetry logging | `spa.templateEnv.telemetry` | `telemetry: { consoleLevel: 0 }` |
| Reduce CLI noise | `log.level` | `log: { level: 2 }` |

## Essential Configurations

### Mock services with executable modules

When a backend is unavailable or needs deterministic responses, install the optional mock-server
plugin and create one executable module per service:

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-mock-server
```

```typescript
// mocks/inventory.mock.ts
import schema from './inventory.openapi.json' with { type: 'json' };
import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

export default defineService({
  key: 'inventory',
  serviceDiscovery: 'new',
  schema,
  components: {
    InventoryItem: { name: () => 'Local item' },
  },
});
```

Run the standalone mock server in one terminal and the app in another:

```sh
ffc mock-server
ffc app dev
```

Normal development keeps real discovery and overlays discovery-visible local modules by key. Use
`ffc app dev --mock` when the app should resolve only bundled presets and local mock modules.

See [Develop with mock services](../../dev-server/docs/mocking.md) for discovery modes and complete
examples.

### Template Environment Variables

**When you need it**: You need to override default Fusion Framework template configuration for development.

**How it works**: Modify the template environment variables that control the SPA bootstrap process.

```typescript
export default defineDevServerConfig(() => ({
  spa: {
    templateEnv: {
      // Override document title
      title: 'My Custom App Title',

      // Override portal configuration
      portal: {
        id: 'my-custom-portal',
      },

      // Modify service discovery
      serviceDiscovery: {
        url: 'https://custom-service-discovery.example.com',
        scopes: ['api://custom-scope/.default']
      },

      // Override MSAL configuration
      msal: {
        tenantId: 'custom-tenant-id',
        clientId: 'custom-client-id',
        redirectUri: 'https://localhost:3000/auth-callback',
        requiresAuth: 'true'
      },

      // Configure telemetry logging level
      telemetry: {
        consoleLevel: 0 // Debug level (most verbose)
      }
    }
  }
}));
```

**Benefits**: Customize the Fusion Framework bootstrap behavior and control browser console logging verbosity for your specific development needs.

**Available telemetry levels:**
- `0`: Debug (shows all telemetry including debug messages)
- `1`: Information (shows info, warnings, errors, critical)
- `2`: Warning (shows warnings, errors, critical - default)
- `3`: Error (shows only errors and critical messages)
- `4`: Critical (shows only critical messages - least verbose)

### AG Grid License Key

Eliminate AG Grid Enterprise license warnings during local development by setting the license key in your `.env` file:

```bash
FUSION_SPA_AG_GRID_KEY=your-license-key-here
```

The dev-portal automatically picks this up and configures AG Grid - no additional setup required.

### Portal Proxy Configuration

**When you need it**: You want to control how portal assets are loaded during development - either from the Fusion portal service or from locally installed portal packages.

**How it works**:
- **`proxy: true`**: Routes portal assets through the dev-server's `/portal-proxy` endpoint, which fetches content from the Fusion portal service
- **`proxy: false`** (default): Loads portal assets directly from `node_modules` (typically `@equinor/fusion-dev-server` or another portal package installed locally)

```typescript
export default defineDevServerConfig(() => ({
  spa: {
    templateEnv: {
      portal: {
        id: 'fusion',
        tag: 'latest',
        proxy: true // Load portal from Fusion portal service via /portal-proxy
      }
    }
  }
}));
```

**Benefits**:
- **`proxy: true`**: Access production portal templates or custom portal deployments via the Fusion portal service
- **`proxy: false`**: Use locally installed portal packages for offline development or custom portal development

### CLI Logging

**When you need it**: You want to control the verbosity of dev-server output in your terminal/console.

**How it works**: Configure the logger level or provide a custom logger instance for CLI output.

```typescript
export default defineDevServerConfig(() => ({
  log: {
    // Info level (default) - shows info, warnings, and errors
    level: 3, 
  }
}));
```

**Available levels:**
- `0`: Silent (no logging)
- `1`: Error (errors only)
- `2`: Warning (warnings and errors)
- `3`: Info (info, warnings, and errors - **default**)
- `4`: Debug (debug, info, warnings, and errors - most verbose)

**Quick reference:**
```typescript
// Quiet development (reduce noise)
log: { level: 2 }

// Default logging (recommended)
log: { level: 3 }

// Debug dev-server issues
log: { level: 4 }
```

## Common Patterns

### Override MSAL for Local Development

```typescript
export default {
  spa: {
    templateEnv: {
      msal: {
        clientId: 'dev-client-id',
        redirectUri: 'http://localhost:3000/auth-callback'
      }
    }
  }
};
```




## Troubleshooting

### Configuration Not Loading
- Verify file name: `dev-server.config.ts` in project root
- Ensure default export: `export default { ... }`
- Check for TypeScript errors in config file

### Services Not Appearing
- Confirm the mock server is running at `http://localhost:4010`.
- Confirm the file matches `mocks/<service>.mock.ts` and default-exports `defineService(...)`.
- Confirm `serviceDiscovery` is not `false` when the framework must resolve the service by key.
- In `--mock` mode, include every required service through a bundled preset or local module.

### Template Variables Not Available
- Variables are injected as `import.meta.env.FUSION_SPA_*`
- Access them as `import.meta.env.FUSION_SPA_MY_VAR`

## Advanced Usage

### Custom Service Discovery Endpoint

For custom environments with different service discovery URLs:

```typescript
export default {
  api: {
    serviceDiscoveryUrl: 'https://custom-discovery.example.com/api/service-discovery'
  }
};
```

> [!WARNING]
> Only use when working with non-standard environments. The default Fusion service discovery endpoint is usually correct.

### Transform service discovery and add custom routes

Use `api.processServices` when the dev server must filter or transform the processed service
discovery response. Call the default `processServices` helper first to preserve local URI rewriting
and generated proxy routes. Use `api.routes` for server-owned endpoints that do not represent a
mocked service:

```typescript
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';
import { processServices } from '@equinor/fusion-framework-dev-server';

export default defineDevServerConfig(() => ({
  api: {
    processServices: (data, args) => {
      const processed = processServices(data, args);
      return {
        ...processed,
        data: processed.data.filter((service) => service.key !== 'deprecated-service'),
      };
    },
    routes: [
      {
        match: '/health',
        middleware: (_request, response) => {
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ status: 'ready' }));
        },
      },
    ],
  },
}));
```

Defining `api.processServices` replaces the default processing entry point. Omit the helper call
only when the host intentionally owns all service URI rewriting and proxy-route generation. Route
entries are merged by `match`, and a route from `dev-server.config.ts` replaces a base route with
the same path.

These extension points remain available for custom hosts and infrastructure. Define application
service behavior in `mocks/<service>.mock.ts` so discovery metadata, OpenAPI operations, and mock
responses stay in one executable module.

### Local mock server

The recommended workflow needs no `api.routes` or `api.processServices` configuration. Start the
foreground mock server, then choose normal overlay or isolated development:

```sh
ffc mock-server
ffc app dev                               # real discovery plus visible local modules
ffc app dev --mock                        # bundled presets plus local modules only
```

`--mock` sets `api.serviceDiscoveryUrl` to `<endpoint>/@fusion-mock/discovery`. A
`dev-server.config.ts` override for `api.serviceDiscoveryUrl` still takes precedence over it.

Use `dev-server.config.ts` only to share mock-server defaults such as a nonstandard path or port:

```typescript
import type {} from '@equinor/fusion-framework-cli-plugin-mock-server';
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(() => ({
  mockServer: { path: 'mocks', port: 4010, seed: 42 },
}));
```

