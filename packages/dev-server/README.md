# Fusion Framework Dev Server

A powerful development server for Fusion Framework applications, built on Vite with integrated service discovery, API proxying, and portal support.

## Features

- 🚀 **Fast Development**: Powered by Vite for lightning-fast HMR and builds
- 🔗 **Service Discovery**: Automatic API service discovery and proxying
- 🏠 **Portal Support**: Built-in portal development with manifest loading
- 🔧 **API Mocking**: Easy mocking and overriding of API responses
- 📊 **Telemetry**: Integrated logging and debugging capabilities
- ⚙️ **Flexible Configuration**: Extensive customization options

## Quick Start

Here's the minimal setup to get a Fusion Framework dev server running:

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';

const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portal: {
        id: '@equinor/fusion-framework-dev-portal',
      },
      title: 'My Fusion App',
      serviceDiscovery: {
        url: 'https://service-discovery.example.com',
        scopes: ['api://example.com/user_impersonation'],
      },
      msal: {
        clientId: 'your-client-id',
        tenantId: 'your-tenant-id',
        redirectUri: '/authentication/login-callback',
        requiresAuth: 'true',
      },
    },
  },
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
  },
});

await devServer.listen();
devServer.printUrls();
```

## Configuration

The dev server accepts a configuration object with the following structure:

### SPA Configuration

Configure the Single Page Application environment and template generation:

```typescript
{
  spa: {
    templateEnv: {
      // Portal configuration
      portal: {
        id: 'your-portal-id', // Portal identifier
      },

      // Application title
      title: 'My Application',

      // Service discovery settings
      serviceDiscovery: {
        url: 'https://service-discovery.example.com',
        scopes: ['scope1', 'scope2'],
      },

      // Authentication configuration
      msal: {
        clientId: 'your-client-id',
        tenantId: 'your-tenant-id',
        redirectUri: '/authentication/login-callback',
        requiresAuth: 'true', // or 'false'
      },

      // Optional telemetry configuration (browser console logging)
      telemetry: {
        consoleLevel: 1, // 0=Debug, 1=Information, 2=Warning, 3=Error, 4=Critical
      },

      // Optional service worker configuration
      serviceWorker: {
        resources: [
          {
            url: '/api',
            rewrite: '/api-v1',
            scopes: ['api://example.com/user_impersonation'],
          },
        ],
      },
    },
  },
}
```

### API Configuration

Configure API proxying and service discovery:

```typescript
{
  api: {
    // Required: Service discovery endpoint
    serviceDiscoveryUrl: 'https://service-discovery.example.com',

    // Optional: Custom service processing
    processServices: (services, route) => {
      // Process and return services with routes
      return processServices(services, route);
    },

    // Optional: Additional API routes
    routes: [
      {
        match: '/api/custom/*',
        middleware: (req, res) => {
          // Custom middleware logic
          res.end(JSON.stringify({ custom: 'response' }));
        },
      },
    ],
  },
}
```

### Logging Configuration

Configure CLI/server-side logging levels and custom loggers:

```typescript
{
  log: {
    // Optional: CLI log level (0=None, 1=Error, 2=Warning, 3=Info, 4=Debug)
    level: 3, // Default is Info level

    // Optional: Custom logger instance
    logger: new ConsoleLogger('my-dev-server'),
  },
}
```

> [!NOTE]
> **Telemetry vs CLI Logging**: The `telemetry.consoleLevel` controls logging output in the browser console (visible to end users), while `log.level` controls server-side logging in the terminal/command line (visible to developers). These use different logging systems with different level mappings.

### Main Functions

#### `createDevServer(options, overrides?)`

Creates and configures a development server instance.

**Parameters:**
- `options` (`DevServerOptions`): Configuration object for the dev server
- `overrides` (`UserConfig`): Optional Vite configuration overrides

**Returns:** `Promise<ViteDevServer>` - Configured Vite development server

**Example:**
```typescript
const devServer = await createDevServer(config);
await devServer.listen();
```

#### `createDevServerConfig(options, overrides?)`

Creates a Vite configuration object for the dev server.

**Parameters:**
- `options` (`DevServerOptions`): Configuration object for the dev server
- `overrides` (`UserConfig`): Optional Vite configuration overrides

**Returns:** `UserConfig` - Vite configuration object

### Utility Functions

#### `processServices(data, args)`

Processes service discovery data and generates proxy routes.

**Parameters:**
- `data` (`FusionService[]`): Array of services from service discovery
- `args.route` (`string`): Base route for proxying
- `args.request` (`IncomingMessage`): HTTP request object

**Returns:** Object with processed services and routes

### Types

#### `DevServerOptions<TEnv>`

Configuration options for the development server.

```typescript
type DevServerOptions<TEnv extends Partial<FusionTemplateEnv>> = {
  spa?: {
    templateEnv: TEnv | TemplateEnvFn<TEnv>;
  };
  api: {
    serviceDiscoveryUrl: string;
    processServices?: ApiDataProcessor<FusionService[]>;
    routes?: ApiRoute[];
  };
  log?: {
    level?: number;
    logger?: ConsoleLogger;
  };
};
```

#### `FusionService`

Represents a service in the Fusion ecosystem.

```typescript
type FusionService = {
  key: string;    // Service identifier
  uri: string;    // Service endpoint URL
  name: string;   // Human-readable service name
};
```

## Examples

### Basic Portal Development

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';

const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portal: { id: 'my-portal' },
      title: 'My Portal',
      serviceDiscovery: {
        url: 'https://service-discovery.example.com',
        scopes: ['api://example.com/user_impersonation'],
      },
      msal: {
        clientId: process.env.CLIENT_ID!,
        tenantId: process.env.TENANT_ID!,
        redirectUri: '/authentication/login-callback',
        requiresAuth: 'true',
      },
    },
  },
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
  },
});

await devServer.listen();
```

### Adding Mock Services

```typescript
import { createDevServer, processServices } from '@equinor/fusion-framework-dev-server';

const devServer = await createDevServer({
  spa: { /* ... spa config ... */ },
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
    processServices: (data, route) => {
      const { data: services, routes } = processServices(data, route);

      // Add mock services
      return {
        data: services.concat({
          key: 'mock-api',
          name: 'Mock API Service',
          uri: '/mock-api',
        }),
        routes: routes.concat({
          match: '/mock-api/*',
          middleware: (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ mock: 'data' }));
          },
        }),
      };
    },
  },
});
```

### Custom Vite Configuration

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';
import { defineConfig } from 'vite';

const devServer = await createDevServer(
  { /* ... dev server config ... */ },
  defineConfig({
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    define: {
      __DEV__: true,
    },
  })
);
```


## Troubleshooting

### Common Issues

#### "Cannot find module '@equinor/fusion-framework-dev-server'"

**Solution:** Make sure the package is installed and you're using the correct import path.

```bash
pnpm add -D @equinor/fusion-framework-dev-server
```

#### Service Discovery Connection Failed

**Problem:** The dev server can't connect to the service discovery endpoint.

**Solutions:**
1. Check that `serviceDiscoveryUrl` is correct and accessible
2. Verify network connectivity to the service discovery endpoint
3. Check for authentication requirements

#### Portal Manifest Not Loading

**Problem:** Portal configuration isn't loading properly.

**Solutions:**
1. Verify the portal ID is correct in the `spa.templateEnv.portal.id` field
2. Check that the portal service is available and responding
3. Ensure proper authentication is configured

#### API Routes Not Working

**Problem:** Custom API routes or service proxying isn't functioning.

**Solutions:**
1. Check the `routes` configuration in the `api` section
2. Verify route patterns match the expected request paths
3. Ensure middleware functions are properly implemented
4. Check for conflicts with existing routes

#### Authentication Issues

**Problem:** MSAL authentication isn't working.

**Solutions:**
1. Verify `clientId` and `tenantId` are correct
2. Check that `redirectUri` matches your application configuration
3. Ensure the required scopes are properly configured
4. Check browser console for authentication errors

### Debug Logging

Enable debug logging to troubleshoot issues:

#### CLI/Server-Side Debug Logging
```typescript
const devServer = await createDevServer({
  // ... config
  log: {
    level: 4, // Debug level (0=None, 1=Error, 2=Warning, 3=Info, 4=Debug)
  },
});
```

#### Browser Console Telemetry Logging
```typescript
{
  spa: {
    templateEnv: {
      // ... other config
      telemetry: {
        consoleLevel: 0, // Debug level (0=Debug, 1=Information, 2=Warning, 3=Error, 4=Critical)
      },
    },
  },
}
```

## Advanced Usage

### Custom Service Processing

For advanced service discovery manipulation:

```typescript
import { createDevServer, processServices } from '@equinor/fusion-framework-dev-server';

const devServer = await createDevServer({
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
    processServices: (services, route) => {
      const { data, routes } = processServices(services, route);

      // Filter out development-only services in production
      const filteredData = data.filter(service =>
        process.env.NODE_ENV !== 'production' || !service.key.includes('dev')
      );

      // Add custom routes for specific services
      const customRoutes = routes.map(route => ({
        ...route,
        // Add custom headers or modify proxy behavior
      }));

      return { data: filteredData, routes: customRoutes };
    },
  },
});
```

### Integration with Build Tools

The dev server works seamlessly with the Fusion Framework CLI:

```bash
# Use with CLI for automatic configuration
npx @equinor/fusion-framework-cli app dev

# Or portal development
npx @equinor/fusion-framework-cli portal dev
```

### Custom Plugins

Extend the dev server with custom Vite plugins:

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';
import myCustomPlugin from 'my-custom-vite-plugin';

const devServer = await createDevServer(
  { /* ... config ... */ },
  {
    plugins: [myCustomPlugin()],
  }
);
```

## Migration Guide

### From Direct Vite Usage

If you're migrating from a direct Vite setup:

1. Replace your Vite configuration with the dev server configuration
2. Move service discovery logic to the `api.processServices` function
3. Configure portal settings in `spa.templateEnv`
4. Update your start script to use `createDevServer`

**Before:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), /* other plugins */],
  server: {
    proxy: { /* proxy config */ },
  },
});
```

**After:**
```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';

const devServer = await createDevServer({
  // Move your config here
});
```

## Contributing

This package is part of the Fusion Framework monorepo. See the main [contributing guide](../../CONTRIBUTING.md) for details.

## License

ISC
