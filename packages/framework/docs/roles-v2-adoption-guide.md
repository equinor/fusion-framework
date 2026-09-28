# Roles V2 end-to-end adoption guide

This guide walks one Roles V2 authorization scenario through every framework layer: production
enablement, React UI gating, component tests, local/browser HTTP mocks, and Playwright identity
selection. Each section names the package that owns the concern so an application only reads the
layer it is changing.

Every example in this guide uses placeholder policy data — role names such as `Reports.Read`,
persona keys such as `operations-persona`, and system names such as `Reports` or `Fusion Apps`.
None of it is a real Roles V2 role hierarchy. Applications supply their own role names and persona
data; the framework owns the reusable plumbing.

> [!IMPORTANT]
> Roles checks in the browser support user-interface decisions only. **A trusted backend must
> always re-authorize protected operations.** No layer described here — including startup checks,
> UI gates, and mocked HTTP responses — is a substitute for backend authorization.

## Who owns which concern

| Concern | Package |
| --- | --- |
| Typed Roles V2 client, provider, and module configuration | [`@equinor/fusion-framework-module-roles`](../../modules/roles/README.md) |
| Active-only and claim-capable React hooks | [`@equinor/fusion-framework-react-app`](../../react/app/src/roles/README.md) |
| Role assignment lists, claim UI, and required-role recovery | [`@equinor/fusion-framework-react-components-roles`](../../react/components/roles/README.md) |
| Component-test composition (`enableRolesMock`, app fixtures) | [`@equinor/fusion-framework-vitest-plugin-react-app`](../../vitest-plugin/react-app/docs/module-mocks.md) |
| Bundled `rolesv2` OpenAPI contract and persona-aware HTTP mock (`defineRolesV2Mock`) | [`@equinor/fusion-openapi-mock-server`](../../utils/openapi-mock-server/docs/getting-started.md) |
| Session-scoped mock identity for local dev and Playwright (`createMockAuth`) | [`@equinor/fusion-openapi-mock-server`](../../utils/openapi-mock-server/docs/testing-with-playwright.md) |
| Runnable reference application | [`cookbooks/app-react-roles`](../../../cookbooks/app-react-roles/README.md) |

## 1. Install dependencies

```sh
pnpm add @equinor/fusion-framework-module-roles @equinor/fusion-framework-react-components-roles
pnpm add -D @equinor/fusion-openapi-mock-server @equinor/fusion-framework-vitest-plugin-react-app
```

`@equinor/fusion-framework-react-app` already ships the active-only and claim-capable hooks, so no
extra install is needed when the app already depends on it.

## 2. Enable Roles V2 and require startup roles

Enable authentication before the Roles module, then declare the access roles the application
cannot start without:

```ts
import { enableRoles } from '@equinor/fusion-framework-module-roles';

enableRoles(configurator, (builder) => {
  builder.requireAccessRoles(['Reports.Read', 'Reports.Export']);
});
```

Every configured role is required (all-role semantics); module initialization throws
`RequiredAccessRolesError` with every missing role name when the signed-in account does not
satisfy the requirement. Omit the callback, or omit `requireAccessRoles`, when the application has
no bootstrap gate. See [module enablement and required-role semantics](../../modules/roles/README.md#enable-roles-v2-and-require-roles-during-initialization)
for exact-match rules, scope limitations, and how requirements accumulate.

Render `AccessRoleBoundary` around the application loader so a bootstrap denial recovers instead of
crashing the host — see [host-root recovery placement](../../react/components/roles/docs/migration.md#place-recovery-around-the-host-loader).

## 3. Choose active-only or claim-capable UI

Use the **narrowest** hook for each UI decision:

| Need | Hook/component | Calls claimable endpoints? |
| --- | --- | --- |
| Show or hide UI based on current access only | `useHasAccessRole` (`@equinor/fusion-framework-react-app/roles`) | No |
| Discover and activate a claimable role assignment | `useAccessRole` (`@equinor/fusion-framework-react-app/roles`) | Yes |
| Render active/claimable/consolidated assignment lists | `useActiveAccessRoleAssignments`, `useClaimableRoleAssignments`, `useRoleAssignments` (`@equinor/fusion-framework-react-components-roles`) | Only the claimable hook |
| Gate a subtree and recover a missing required role | `AccessRoleBoundary`, `RolesProvider` (`@equinor/fusion-framework-react-components-roles`) | Yes, during recovery |

```tsx
import { useHasAccessRole } from '@equinor/fusion-framework-react-app/roles';

export const ReportsNavigation = () => {
  const access = useHasAccessRole(['Reports.Read', 'Reports.Export'], { required: false });

  if (access.isLoading) return <p>Checking access...</p>;
  if (access.error) return <p>Could not check access.</p>;

  return access.hasAccessRole ? <ReportsLink /> : null;
};
```

`useHasAccessRole` never queries claimable-role assignments, so a read-only visibility check stays
on the narrowest service surface and the fewest failure modes. Reach for `useAccessRole` only when
the same component also needs to discover and activate a claimable assignment. See
[active-only React integration](../../react/app/src/roles/README.md) for full loading, refresh, and
error semantics, and [required-role recovery](../../react/components/roles/README.md#require-roles-before-rendering)
for the claim UI and outage-safe recovery behavior.

## 4. Compose component tests with `enableRolesMock`

Component and application tests need static, known role data without HTTP, authentication, or
service discovery. `enableRolesMock` runs the production module initializer and provider against a
static internal client, so consumers still receive a real `RolesProvider`.

Compose it with the app's production configuration instead of replacing the configuration
outright, so unrelated modules (context, feature flags, service discovery, and so on) keep their
real production setup:

```tsx
import { enableRolesMock } from '@equinor/fusion-framework-module-roles/mock';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

export const test = baseTest.extend('configureApp', ({ configureApp }) => (configurator, args) => {
  // Preserve the app's real module configuration before layering the Roles mock on top.
  configureApp?.(configurator, args);

  enableRolesMock(configurator, (mock) => {
    mock
      .setActiveAccessRoleAssignments([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }])
      .setConsolidatedClaimableRoleAssignments([
        { id: 'assignment-id', claimableRole: { id: 'role-id' } },
      ])
      .requireAccessRoles(['Reports.Read']);
  });
});
```

Calling `configureApp?.(configurator, args)` first, then adding the Roles mock, keeps every other
production module intact — `enableRolesMock` only ever replaces the Roles module's client. Override
a single provider operation with `vi.spyOn` when a test needs behavior beyond static reads (for
example, a rejected activation). See [Seed several app dependencies](../../vitest-plugin/react-app/docs/module-mocks.md#seed-several-app-dependencies)
for the general composition pattern and [static provider data](../../modules/roles/README.md#static-provider-data)
for the full `RolesMockConfigurator` API.

## 5. Mock Roles V2 over HTTP for local dev and Playwright

Use `defineRolesV2Mock` when a scenario needs real `RolesClient` request paths, account
resolution, response validation, activation/deactivation side effects, or a Playwright browser —
anything the in-process module mock does not exercise. The helper merges typed application policy
onto the bundled `rolesv2` OpenAPI contract, so a `<name>.mock.ts` module never hand-writes account
routes:

```ts
// mocks/rolesv2.mock.ts
import { defineRolesV2Mock } from '@equinor/fusion-openapi-mock-server/presets/fusion';

export default defineRolesV2Mock({
  accessRoles: [
    { id: 'read-role-id', name: 'Reports.Read', system: { id: 'reports-system', name: 'Reports' } },
    { id: 'export-role-id', name: 'Reports.Export', system: { id: 'reports-system', name: 'Reports' } },
  ],
  accounts: {
    'granted-persona': {
      activeAccessRoleAssignments: [
        { systemName: 'Reports', accessRoleName: 'Reports.Read', assignmentType: 'Global' },
        { systemName: 'Reports', accessRoleName: 'Reports.Export', assignmentType: 'Global' },
      ],
    },
    'read-only-persona': {
      activeAccessRoleAssignments: [
        { systemName: 'Reports', accessRoleName: 'Reports.Read', assignmentType: 'Global' },
      ],
    },
    'claimable-persona': {
      activeAccessRoleAssignments: [],
      claimableRoleAssignments: [
        {
          id: 'claimable-assignment-id',
          reason: 'Granted by the reporting team role.',
          type: 'Global',
          isActive: false,
          scope: { isGlobal: true, value: null },
          claimableRole: {
            id: 'reporting-team-role-id',
            name: 'reporting-team',
            displayName: 'Reporting team member',
            system: { id: 'reports-system', name: 'Reports' },
            accessRoleMappings: [
              { accessRole: { id: 'read-role-id', name: 'Reports.Read' }, reason: 'Granted by role.' },
            ],
          },
        },
      ],
    },
    'denied-persona': {
      activeAccessRoleAssignments: [],
      claimableRoleAssignments: [],
    },
  },
});
```

Account keys are arbitrary placeholder data and must match the `userId` selected through
`createMockAuth`. Start the app against the mock server, point service discovery at
`http://localhost:<port>/@fusion-mock/discovery`, and enable Roles normally with `enableRoles` —
only the HTTP backend is mocked; the real `RolesClient` still resolves service discovery and reads
the authenticated account. See [persona-aware Roles V2 policy](../../utils/openapi-mock-server/docs/getting-started.md#define-persona-aware-roles-v2-policy)
for the full account/activation schema, deactivation, and session-isolation guarantees.

### Model the Roles-service-error scenario

`defineRolesV2Mock` accounts describe successful policy, not outages. Model a Roles V2 service
failure with the mock server's generic runtime override instead, so the failure covers exactly one
operation:

```ts
await request.post('http://localhost:4010/@fusion-mock/rolesv2/listAccountActiveAccessRoleAssignments', {
  data: { status: 503, mock: { error: 'Roles V2 is temporarily unavailable.' } },
});
```

Reset the override afterward with `POST /@fusion-mock/reset`. A service error during startup
enrichment must still preserve the confirmed access denial and the required role names — see
[recovery behavior when enrichment fails](../../react/components/roles/README.md#require-roles-before-rendering).

## 6. Select a persona in Playwright

`createMockAuth` selects a mock identity per browser context by `userId`, matching an account key
declared in `defineRolesV2Mock`. Selecting a persona and reloading is enough to switch role policy
without restarting the mock server, dev server, or app:

```ts
import { createMockAuth } from '@equinor/fusion-openapi-mock-server';
import { expect, test } from '@playwright/test';

const mockAuth = createMockAuth('http://localhost:4010');

test('renders the granted scenario', async ({ context, page }) => {
  await mockAuth.setUser(context.request, { userId: 'granted-persona', name: 'Granted Persona' });
  await page.goto('/apps/example-app');
  await expect(page.getByRole('main')).toContainText('Reports / Reports.Export');
});

test('isolates concurrent personas in separate browser contexts', async ({ browser }) => {
  const readOnlyContext = await browser.newContext();
  const deniedContext = await browser.newContext();

  await Promise.all([
    mockAuth.setUser(readOnlyContext.request, { userId: 'read-only-persona' }),
    mockAuth.setUser(deniedContext.request, { userId: 'denied-persona' }),
  ]);

  const [readOnlyPage, deniedPage] = await Promise.all([
    readOnlyContext.newPage(),
    deniedContext.newPage(),
  ]);
  await Promise.all([readOnlyPage.goto('/apps/example-app'), deniedPage.goto('/apps/example-app')]);

  // Assert the read-only and denied experiences independently, then close both contexts.
  await Promise.all([readOnlyContext.close(), deniedContext.close()]);
});
```

Each browser context has its own cookie jar, so concurrent contexts run independent personas
without cross-talk, and re-selecting a `userId` on the same context switches identity in place
after a reload. See [session-scoped identity and its security boundary](../../utils/openapi-mock-server/docs/testing-with-playwright.md#emulate-users-without-restarting-the-app)
for scope handling, the loopback trust boundary, and why this mock never accepts real credentials.
[`cookbooks/app-react-roles`](../../../cookbooks/app-react-roles/README.md) runs this exact flow,
including a recovery persona that claims a required role and a second exporter assignment.

## 7. Scenario coverage matrix

Every scenario below is expressed as placeholder account data or an HTTP override — never as a
special framework code path:

| Scenario | Model it as | Layer that shows it |
| --- | --- | --- |
| Granted (full access) | Account with every required active assignment | `useHasAccessRole` returns `true`; `AccessRoleBoundary` renders children immediately |
| Read-only / partial access | Account with some, but not all, required active assignments | `useHasAccessRole({ required: true })` returns `false`; app renders a reduced experience |
| Claimable | Account with no active assignment but an eligible `claimableRoleAssignments` entry | `AccessRoleBoundary` recovery flow offers activation; `useAccessRole` exposes `hasClaimableRoleAssignmentForAccessRole` |
| Denied | Account with no active or claimable assignment for the required role | `AccessRoleBoundary` shows the role-does-not-exist or not-claimable view |
| Roles-service-error | Runtime operation override returning a 4xx/5xx status | Recovery UI shows unavailable enrichment detail while preserving the original denial |

## 8. Choose the in-process module mock or the HTTP mock server

| Use the in-process module mock (`enableRolesMock`) when... | Use the HTTP mock server (`defineRolesV2Mock`) when... |
| --- | --- |
| The test needs known role data with no HTTP, service discovery, or authentication setup | The test must exercise `RolesClient` request paths, account resolution, or response validation |
| The test runs under Vitest against a component or hook | The test runs in a real browser (Playwright) or needs deterministic HTTP responses during local development |
| Activation/deactivation behavior can be overridden per test with `vi.spyOn` | Activation/deactivation must produce real, schema-valid HTTP responses and session-isolated state |

Both boundaries return the production `RolesProvider`; the difference is only which layer is
faked. Start with the in-process mock and move to the HTTP mock server only when a test needs the
behavior the in-process client cannot express. See
[Choose a Fusion testing layer](testing-choosing-a-layer.md) for the same decision generalized
across every Fusion module.

## Related documentation

- [Roles V2 module reference](../../modules/roles/README.md)
- [Active-only and claim-capable React hooks](../../react/app/src/roles/README.md)
- [Role assignment components and recovery](../../react/components/roles/README.md)
- [Component-test composition](../../vitest-plugin/react-app/docs/module-mocks.md)
- [Persona-aware Roles V2 HTTP mock](../../utils/openapi-mock-server/docs/getting-started.md)
- [Session-scoped mock identity](../../utils/openapi-mock-server/docs/testing-with-playwright.md)
- [Roles V2 cookbook](../../../cookbooks/app-react-roles/README.md)
- [Mock-auth persona cookbook](../../../cookbooks/app-react-mock-playwright/README.md)
