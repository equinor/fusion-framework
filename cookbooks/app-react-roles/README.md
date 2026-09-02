# React Roles V2 Cookbook

This cookbook demonstrates how a Fusion Framework React application configures required Roles V2
access, displays active and claimable roles, checks one access role, and claims an assignment.

## When to use this cookbook

Use this example when an application needs to:

- stop initialization unless required access roles are active;
- render active assignments from `RolesProvider.getActiveRoles`;
- render claimable assignments from `RolesProvider.getClaimableRoles`;
- check and claim an access role with `useRole`.

Roles checks in the browser support user-interface decisions. A trusted backend must still enforce
authorization for protected operations.

## Configure required roles

[`src/config.ts`](./src/config.ts) enables the app-scoped Roles module and requires `Reports.Read`:

```ts
enableRoles(configurator, (builder) => {
  builder.requireRoles(['Reports.Read']);
});
```

Replace `Reports.Read` with a Roles V2 `accessRoleName` assigned by the application registration.
Every configured role is required. Module initialization throws `RequiredRolesError` before the app
renders when the signed-in account does not satisfy the requirement.

## Show and claim roles

[`src/App.tsx`](./src/App.tsx) uses the provider for complete role lists:

```ts
const roles = useAppModule<RolesModule>('roles');
const [activeRoles, claimableRoles] = await Promise.all([
  roles.getActiveRoles(),
  roles.getClaimableRoles(),
]);
```

The same component uses `useRole('Reports.Export')` for reactive check and claim state. A successful
claim invalidates the Roles client caches; the cookbook then reloads both rendered lists.

Update `TARGET_ACCESS_ROLE` in [`src/App.tsx`](./src/App.tsx) to an access role granted by one of the
application's claimable assignments.

## Run the cookbook

The app expects a Fusion host that provides authentication and service discovery:

```bash
pnpm --filter @equinor/fusion-framework-cookbook-app-react-roles dev
```

## Test with static Roles data

Use `enableRolesMock` for component tests that need known provider data without HTTP:

```ts
enableRolesMock(configurator, (mock) => {
  mock
    .setActiveRoles([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }])
    .setClaimableRoles([{ id: 'assignment-id', claimableRole: { name: 'Report exporter' } }])
    .requireRoles(['Reports.Read']);
});
```

Consumers still receive the production `RolesProvider`. Use `vi.spyOn` on provider methods such as
`claimRole` when a test needs a specific success, failure, or pending response.

## Test the real Roles client with generated responses

Use the normal `enableRoles` configuration with the Fusion OpenAPI mock server when the test should
cover `RolesClient` request paths, account resolution, response schemas, or caching:

```bash
pnpm exec fusion-mock --preset=fusion --port 4010
```

Point service discovery at `http://localhost:4010/@fusion-mock/discovery`. The bundled Fusion preset
includes `rolesv2`, so the application keeps its production Roles configuration while HTTP responses
are generated from the service contract.
