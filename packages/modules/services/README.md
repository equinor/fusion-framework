# @equinor/fusion-framework-module-services

Typed API service clients for the Fusion Framework. Provides factory-based access to platform backend services (bookmarks, context, notification, people) with versioned endpoints, automatic HTTP client resolution, and response validation.

## Features

- **Domain-specific API clients** — `BookmarksApiClient`, `ContextApiClient`, `NotificationApiClient`, `PeopleApiClient`
- **Versioned endpoints** — each service exposes version-aware methods (e.g. `v1`, `v2`, `v4`) with type-safe request/response shapes
- **Dual consumption patterns** — every endpoint supports both `Promise` (`json`) and observable (`json$`) return types
- **Automatic HTTP client resolution** — resolves named clients through the HTTP module, falling back to service-discovery
- **Response validation** — built-in response handler validates HTTP status codes and throws structured `ApiProviderError` on failure
- **Zod schema selectors** — `schemaSelector` utility for runtime response parsing with Zod schemas
- **Bookmark Zod schemas** — pre-built Zod schemas (`ApiBookmarkSchema`, `ApiBookmarkPayload`) for bookmark entities

## Installation

```sh
pnpm add @equinor/fusion-framework-module-services
```

## Usage

### Enable the module

Register the services module during app configuration:

```ts
import { enableServices } from '@equinor/fusion-framework-module-services';

export const configure = (configurator) => {
  enableServices(configurator);
};
```

### Custom client factory

Override HTTP client resolution with `configureServices`:

```ts
import { configureServices } from '@equinor/fusion-framework-module-services';

export const configure = (configurator) => {
  configurator.addConfig(
    configureServices((cfg) => {
      cfg.createClient = async (name) => myHttpClientFactory(name);
    }),
  );
};
```

### Create and use API clients

Access the services provider at runtime to create domain clients:

```ts
// Bookmarks
const bookmarks = await provider.services.createBookmarksClient('json');
const allBookmarks = await bookmarks.query('v1');
const single = await bookmarks.get('v1', { bookmarkId: 'abc-123' });

// Context
const context = await provider.services.createContextClient('json');
const ctx = await context.get('v1', { id: 'context-id' });
const results = await context.query('v1', { query: 'my search' });

// Notifications
const notifications = await provider.services.createNotificationClient('json');
const all = await notifications.getAll('v1');
await notifications.setSeenByUser('v1', { notificationId: 'notif-id' });

// People
const people = await provider.services.createPeopleClient();
const person = await people.get('v4', 'json', { azureId: 'azure-unique-id' });
const photo = await people.photo('v2', 'blob', { azureId: 'azure-unique-id' });
```

## API Reference

### Module setup

| Export | Description |
|---|---|
| `enableServices` | Register the services module with the framework configurator |
| `configureServices` | Create a module config object with a custom configuration callback |
| `module` | The raw module definition |

### Provider

| Export | Description |
|---|---|
| `ApiProvider` / `IApiProvider` | Services provider with factory methods for creating domain clients |
| `ApiConfigurator` / `IApiConfigurator` | Configuration interface (set `createClient` to override HTTP client resolution) |
| `ApiProviderError` | Structured error thrown on non-OK HTTP responses |

### Domain clients

| Client | Import path | Services |
|---|---|---|
| `BookmarksApiClient` | `@equinor/fusion-framework-module-services/bookmarks` | CRUD bookmarks, favourites |
| `ContextApiClient` | `@equinor/fusion-framework-module-services/context` | Get, query, related contexts |
| `NotificationApiClient` | `@equinor/fusion-framework-module-services/notification` | CRUD notifications, settings |
| `PeopleApiClient` | `@equinor/fusion-framework-module-services/people` | Get, query, photo, suggest, resolve |

### Types and utilities

| Export | Description |
|---|---|
| `ClientMethod` | Maps `json` / `json$` to `Promise` / `StreamResponse` |
| `ClientDataMethod` | Maps `blob` / `blob$` for binary responses |
| `ApiClientFactory` | Factory function type for creating named HTTP clients |
| `FilterAllowedApiVersions` | Utility type for constraining API version unions |
| `ExtractApiVersion` | Utility type for resolving a version key to its string value |
| `UnsupportedApiVersion` | Error class for invalid API version strings |
| `extractVersion` | Resolves a version key or value from an API-version enum |
| `schemaSelector` | Creates a response selector that validates with a Zod schema |
| `isApiPerson` | Type-guard factory for validating person entities by API version |

## Configuration

The services module depends on:

- **`@equinor/fusion-framework-module-http`** — provides named HTTP clients
- **`@equinor/fusion-framework-module-service-discovery`** (optional) — automatic client resolution via service discovery

When neither a registered HTTP client nor service-discovery is available for a service name, the module throws an error during client creation.
