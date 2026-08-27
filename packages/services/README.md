# @equinor/fusion-services

Tree-shakeable, function-based clients for Fusion platform services. Each API operation is an
independent export, so applications bundle only the service endpoints they use.

## Installation

```sh
pnpm add @equinor/fusion-services
```

`@equinor/fusion-framework-module-http` is a peer dependency. Service functions accept an
`IHttpClient` created by that module, which remains responsible for service discovery and
authentication.

## Quick start

Import from a service subpath. The package root intentionally has no aggregated API.

```ts
import { getRole, listRoles } from '@equinor/fusion-services/roles';

const rolesClient = await modules.http.createClient('roles');

const role = await getRole('v1', rolesClient)({
  roleIdentifier: 'reader',
});

const roles = await listRoles('v1', rolesClient)({
  top: 25,
});
```

Every endpoint uses the same two-stage call:

1. Bind the API version, `IHttpClient`, and optional client method.
2. Pass the arguments for that operation.

The API version selects both the argument and response types. Inputs and responses are validated
with the matching versioned Zod schemas.

## Promises and observables

Endpoints use the promise-based `json` method by default. Pass `json$` to receive an observable
stream with the same payload type.

```ts
const role = await getRole('v1', rolesClient)({
  roleIdentifier: 'reader',
});

getRole('v1', rolesClient, 'json$')({
  roleIdentifier: 'reader',
}).subscribe({
  next: (value) => console.log(value.displayName),
  error: (error) => console.error(error),
});
```

## Available services

| Service | Import | Documentation |
| --- | --- | --- |
| Fusion Roles V2 | `@equinor/fusion-services/roles` | [Roles service guide](./docs/roles.md) |

Each service guide describes its domain, common operations, versioned types, runtime validation,
and published OpenAPI snapshots.

## Package design

- Service-specific imports prevent unrelated service graphs from entering an application bundle.
- Standalone endpoint functions allow endpoint-level tree shaking.
- API versions discriminate request and response types at compile time and runtime.
- Zod schemas are the source of truth for inferred API model types.
- Authentication and service discovery stay in `@equinor/fusion-framework-module-http`.

Repository maintainers should use [CONTRIBUTING.md](./CONTRIBUTING.md) when adding a service,
adding an API version, or synchronizing an existing OpenAPI contract.
