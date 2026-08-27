# Fusion Roles service

The Roles client provides tree-shakeable access to the Fusion Roles V2 API. Use it to manage
roles, claimable roles, access roles, owning systems, scopes, assignments, activations, and role
binding configurations.

All 73 operations are exported from:

```text
@equinor/fusion-services/roles
```

## Create an HTTP client

Roles functions accept an `IHttpClient` from `@equinor/fusion-framework-module-http`. The HTTP
module supplies the base URL and authentication token; `@equinor/fusion-services` supplies the
typed request path, payload, and response validation.

```ts
const rolesClient = await modules.http.createClient('roles');
```

## Fetch and manage roles

```ts
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from '@equinor/fusion-services/roles';

const role = await getRole('v1', rolesClient)({
  roleIdentifier: 'reader',
});

const page = await listRoles('v1', rolesClient)({
  top: 25,
  skip: 0,
});

await createRole('v1', rolesClient)({
  name: 'incident-responder',
  displayName: 'Incident responder',
  systemIdentifier: 'my-system',
});

await updateRole('v1', rolesClient)({
  roleIdentifier: 'incident-responder',
  description: 'Handles active operational incidents',
});

await deleteRole('v1', rolesClient)({
  roleIdentifier: 'incident-responder',
});
```

`getRole` accepts a role UUID or unique role name. Collection operations return a paged envelope
whose `value` property contains the matching resources.

## Assign roles to accounts

Role assignments grant permanent roles to user or application accounts.

```ts
import {
  assignRole,
  listAccountRoleAssignments,
  listRoleAssignments,
} from '@equinor/fusion-services/roles';

await assignRole('v1', rolesClient)({
  roleIdentifier: 'reader',
  accountIdentifier: 'user@equinor.com',
});

const accountAssignments = await listAccountRoleAssignments('v1', rolesClient)({
  accountIdentifier: 'user@equinor.com',
});

const roleAssignments = await listRoleAssignments('v1', rolesClient)({
  roleIdentifier: 'reader',
});
```

The service also exports `getRoleAssignment`, `updateRoleAssignment`, `deleteRoleAssignment`, and
`deleteRoleAssignments`.

## Claim and release claimable roles

A claimable role is assigned to an account before it can be activated for a limited period. The
assignment records eligibility; each activation records when the account claimed the role.

```ts
import {
  activateClaimableRoleAssignment,
  deactivateClaimableRoleAssignment,
  listAccountClaimableRoleAssignments,
} from '@equinor/fusion-services/roles';

await listAccountClaimableRoleAssignments('v1', rolesClient)({
  accountIdentifier: 'user@equinor.com',
});

const assignmentId = '6b1d4f2a-8c3e-4d59-9f70-1a2b3c4d5e6f';

await activateClaimableRoleAssignment('v1', rolesClient)({
  accountIdentifier: 'user@equinor.com',
  claimableRoleAssignmentId: assignmentId,
  reason: 'On-call incident 4471',
  hours: 8,
});

await deactivateClaimableRoleAssignment('v1', rolesClient)({
  accountIdentifier: 'user@equinor.com',
  claimableRoleAssignmentId: assignmentId,
});
```

## Choose an API version

The version is the first argument to every operation. Roles API 1.0 can be selected with `'v1'`,
`'1.0'`, or `ApiVersion.v1`.

```ts
import { ApiVersion, getRole } from '@equinor/fusion-services/roles';

await getRole('v1', rolesClient)({ roleIdentifier: 'reader' });
await getRole('1.0', rolesClient)({ roleIdentifier: 'reader' });
await getRole(ApiVersion.v1, rolesClient)({ roleIdentifier: 'reader' });
```

Unsupported versions fail before the HTTP client sends a request. The selected version controls:

- The accepted operation arguments
- The `api-version` query parameter
- The response schema
- The inferred TypeScript response type

## Use operation and model types

Each operation exports version, argument, response, and result types. API models carry their API
version in the type name.

```ts
import type {
  ApiRoleV1,
  GetRoleArg,
  GetRoleResponse,
  GetRoleResult,
} from '@equinor/fusion-services/roles';

type Arguments = GetRoleArg<'v1'>;
type Response = GetRoleResponse<'v1'>;
type PromiseResult = GetRoleResult<'v1'>;
type ObservableResult = GetRoleResult<'v1', 'json$'>;
```

`ApiRoleV1` and other API model types are inferred from their versioned Zod schemas. Request
arguments and response payloads are validated at runtime; invalid values throw a `z.ZodError`.
Schema and field descriptions provide domain context alongside each validation issue path.

## Use promises or observables

The optional third argument selects the `IHttpClient` method:

```ts
const promisedRole = getRole('v1', rolesClient, 'json')({
  roleIdentifier: 'reader',
});

const streamedRole = getRole('v1', rolesClient, 'json$')({
  roleIdentifier: 'reader',
});
```

`json` is the default and returns a promise. `json$` returns a `StreamResponse` observable with the
same response payload type.

## Mock the Roles API

The complete Roles API 1.0 OpenAPI document ships as a versioned JSON subpath:

```ts
import rolesV1OpenApi from '@equinor/fusion-services/roles/v1/openapi.json' with {
  type: 'json',
};
```

The snapshot contains every operation, component schema, security declaration, tag, and server
published by the service. It can drive contract-aware mocks or test data generation without a
network request.

TypeScript projects importing the JSON snapshot need `resolveJsonModule` and a module resolution
mode that honors package exports, such as `bundler`, `node16`, or `nodenext`.

## Operation families

| Family | Capabilities |
| --- | --- |
| Accounts | Access-role, claimable-role, permanent-role, and consolidated assignments; activate and deactivate claimable roles |
| Claimable roles | CRUD, access-role mappings, assignments, and activation history |
| Roles | CRUD, access-role mappings, assignments, and batch assignment deletion |
| Systems | CRUD, access roles, and access-role assignments |
| Scope types | CRUD |
| Role binding configurations | CRUD, execution history, notifications, status, and expired-history purge |
| Platform | Roles V2 event subscription and the public JSON schema catalog |

Use editor completion and the exported TSDoc for operation-specific argument, response, error, and
authorization details.
