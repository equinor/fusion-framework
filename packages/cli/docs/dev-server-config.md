The dev-server supports optional configuration through a `dev-server.config.ts` file in your project root. This allows you to customize how your application interacts with the Fusion Framework during development.

> [!NOTE]
> Basic server options like `port`, `host`, and `open` are configured via CLI flags or Vite configuration, not through `dev-server.config.ts`.

## Why Configure the Dev Server?

The default dev-server configuration works for most applications, but you may want to customize it when:

- **Testing API integrations**: Mock services or override API responses during development
- **Debugging service discovery**: Filter or modify discovered services for testing
- **Customizing the development environment**: Adjust template variables, CLI logging, or browser console logging
- **Isolating development scenarios**: Configure different behaviors for different development stages

## Getting Started

Create a `dev-server.config.ts` file in your project root. Start simple with object configuration:

```typescript
// Simple object configuration
export default {
  api: {
    routes: [{
      match: '/my-api/test',
      middleware: (req, res) => res.end('OK')
    }]
  }
};
```

For conditional configuration based on environment or other runtime logic, use function configuration:

```typescript
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(({ base }) => {
  // Access to base config and environment for advanced logic
  const isLocalDev = process.env.USER === 'your-username'; // Example condition

  return {
    api: {
      routes: [
        // Different routes based on conditions
        isLocalDev && { match: '/api/local-dev', middleware: localHandler }
      ].filter(Boolean) // Remove falsy values
    }
  };
});
```

> [!TIP]
> Start with object config. Use function config only when you need conditional logic or access to the base configuration.

## TypeScript Integration

For full TypeScript support and intellisense, import the configuration types:

```typescript
import { defineDevServerConfig, type DevServerConfig } from '@equinor/fusion-framework-cli';

// Fully typed configuration
export default defineDevServerConfig(({ base }): DevServerConfig => ({
  ...base,
  api: {
    ...base.api,
    routes: [
      {
        match: '/api/users',
        middleware: (req, res) => {
          // req and res are properly typed
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
        }
      }
    ]
  }
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
| `api.routes` | Mock API endpoints | Testing UI without backend, error scenarios |
| `api.processServices` | Modify service discovery | Add mock services, override endpoints |
| `api.serviceDiscoveryUrl` | Change discovery endpoint | Custom/dev environments |
| `spa.templateEnv` | Override Fusion config | Portal settings, MSAL config, telemetry |
| `log` | Control CLI logging verbosity | Debug dev-server issues, reduce terminal noise |

## How Configuration Works

The `dev-server.config.ts` file is designed for **overriding** the default dev-server behavior. You only specify what you want to change - the system automatically merges your overrides with the defaults.

### Object Configuration (Recommended)
Just export the properties you want to override:

```typescript
export default {
  // Only override what you need to change
  api: {
    routes: [{
      match: '/api/users',
      middleware: (req, res) => res.end(JSON.stringify([]))
    }]
  },
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
    api: {
      routes: [
        // Your routes automatically merge with any existing ones
        { match: '/api/test', middleware: testHandler }
      ]
    }
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
| Mock an API endpoint | `api.routes` | `routes: [{ match: '/api/users', middleware: (req, res) => res.end('[]') }]` |
| Add a mock service | `api.processServices` | Add services to the service discovery response |
| Override MSAL config | `spa.templateEnv.msal` | `msal: { clientId: 'dev-client-id' }` |
| Change telemetry logging | `spa.templateEnv.telemetry` | `telemetry: { consoleLevel: 0 }` |
| Reduce CLI noise | `log.level` | `log: { level: 2 }` |

## Essential Configurations

### API Mocking

**When you need it**: Your application depends on backend services that aren't available during development, or you want to test specific API responses without hitting real services.

**How it works**: Add custom routes that intercept API calls and return mock data.

```typescript
export default defineDevServerConfig(() => ({
  api: {
    routes: [
      {
        match: '/api/users',
        middleware: (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([
            { id: 1, name: 'John Doe', role: 'developer' },
            { id: 2, name: 'Jane Smith', role: 'designer' }
          ]));
        }
      },
      // Mock error responses
      {
        match: '/api/users/404',
        middleware: (req, res) => {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'User not found' }));
        }
      }
    ]
  }
}));
```

**Benefits**: Develop UI components and user flows without backend dependencies. Test error handling scenarios easily.

### Service Discovery Customization

**When you need it**: You're developing against a service that doesn't exist yet in the remote service discovery, or you want to override service endpoints for local development.

**How it works**: Add mock services to the service discovery response that your application can use during development.

```typescript
export default defineDevServerConfig(() => ({
  api: {
    processServices: (dataResponse) => {
      const { data, routes } = dataResponse;

      // Add mock services for development
      const mockServices = [
        {
          key: 'my-new-service',
          name: 'My New Service (Mock)',
          uri: '/api/mock-service' // This will be proxied by the dev server
        },
        {
          key: 'beta-feature-api',
          name: 'Beta Feature API (Mock)',
          uri: 'https://beta-api.example.com'
        }
      ];

      return {
        data: [...data, ...mockServices],
        routes
      };
    }
  }
}));
```

**Benefits**: Develop against planned services before they're deployed. Test integration scenarios with mock endpoints.

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
- Ensure `processServices` returns `{ data: Service[], routes: Route[] }`
- Verify you're not accidentally filtering out needed services

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

