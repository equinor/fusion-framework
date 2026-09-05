# React Roles V2 Cookbook

This cookbook demonstrates how a Fusion Framework React application requires Roles V2 access and
uses focused React hooks to display and claim role assignments.

## When to use this cookbook

Use this example when an application needs to:

- render active assignments with `useRoles`;
- render and activate claimable assignments with `useClaimableRoles`;
- claim an assignment and automatically refresh both lists;
- stop initialization unless `ProView.Admin.DevOps` is active.

Roles checks in the browser support user-interface decisions. A trusted backend must still enforce
authorization for protected operations.

## Configure Roles V2

[`src/config.ts`](./src/config.ts) enables the app-scoped Roles module and requires the registered
`ProView.Admin.DevOps` access role:

```ts
enableRoles(configurator, (builder) => {
  builder.requireRoles(['ProView.Admin.DevOps']);
});
```

Every configured role is required. Module initialization throws `RequiredRolesError` before the app
renders when the signed-in account does not satisfy the requirement.

## Show and claim roles

[`src/App.tsx`](./src/App.tsx) reads active and claimable roles through separate hooks:

```ts
import { useClaimableRoles, useRoles } from '@equinor/fusion-framework-react-components-roles';

const active = useRoles();
const claimable = useClaimableRoles();
```

[`src/index.ts`](./src/index.ts) installs `RolesProvider` once around the application:

```ts
const appComponent = createElement(RolesProvider, undefined, createElement(App));
```

The provider owns one observable action/flow store. Each hook exposes focused loading, error, and
reload state. `useClaimableRoles` also exposes activation state; successful claims refresh both role
collections automatically.

## Run the cookbook

The app expects a Fusion host that provides authentication and service discovery:

```bash
pnpm --filter @equinor/fusion-framework-cookbook-app-react-roles dev
```

For a standalone local app backed by deterministic Roles V2 HTTP responses, run:

```bash
pnpm --filter @equinor/fusion-framework-cookbook-app-react-roles dev:mock
```

This starts the app and the Fusion OpenAPI mock server together. The local
[`mocks/rolesv2.mock.ts`](./mocks/rolesv2.mock.ts) service merges onto the bundled `rolesv2`
contract. It first exposes a synthetic claimable role that grants `ProView.Admin.DevOps`, allowing
the host recovery flow to be repeated. After activation, the app loads and exposes a second
claimable Reports exporter assignment. The app still uses the production `RolesClient`; only
service discovery and HTTP responses are local.

## Test with static Roles data

Use `enableRolesMock` for component tests that need known provider data without HTTP:

```ts
enableRolesMock(configurator, (mock) => {
  mock
    .setActiveRoles([{ systemName: 'Fusion Apps', accessRoleName: 'Fusion.Apps.FullControl' }])
    .setClaimableRoles([{ id: 'assignment-id', claimableRole: { name: 'Report exporter' } }])
    .requireRoles(['Fusion.Apps.FullControl']);
});
```

Consumers still receive the production Roles module provider (`IRolesProvider`). Use `vi.spyOn` on
provider methods such as `claimRole` when a test needs a specific success, failure, or pending
response.

## Test the real Roles client with generated responses

Use the normal `enableRoles` configuration with the Fusion OpenAPI mock server when the test should
cover `RolesClient` request paths, account resolution, response schemas, or caching:

```bash
pnpm --filter @equinor/fusion-framework-cookbook-app-react-roles mock:server
```

Point service discovery at `http://localhost:4012/@fusion-mock/discovery`. The bundled Fusion preset
includes `rolesv2`; the cookbook's local service then overrides only the operations used by the app.
This keeps production Roles configuration and request validation in the test path while making the
rendered role data repeatable.

The Playwright test starts both servers, claims the required role through the host recovery view,
verifies that the app loads without a refresh, and compares the resolved app with its visual snapshot:

```bash
pnpm --filter @equinor/fusion-framework-cookbook-app-react-roles test
```
