# Fusion Framework Roles module

`@equinor/fusion-framework-module-roles` makes the Fusion Roles V2 service available as a
typed Fusion Framework module. Use it when a host, portal, or application needs authenticated
RolesV2 requests without resolving service discovery or constructing an HTTP client itself.

The module resolves the `rolesv2` service, uses the service scopes with the framework HTTP and
authentication modules, and exposes account-scoped role operations directly through the roles provider.
When the event and telemetry modules are enabled, the provider also reports operation outcomes.

## Enable Roles V2 and require roles during initialization

Enable HTTP, authentication, and service discovery before enabling the roles module:

```ts
import { enableRoles } from '@equinor/fusion-framework-module-roles';

enableRoles(configurator, (builder) => {
  builder.requireRoles(['Reports.Read', 'Reports.Export']);
});
```

`RolesModuleConfigurator.requireRoles` checks the configured access-role names before module
initialization completes. Every configured role must be active for the signed-in account. Role
names use exact, case-sensitive matching against the Roles V2 `accessRoleName`.

Initialization throws `RequiredRolesError` containing all missing role names when the account
does not satisfy the requirements. Omit `requireRoles`, or call `enableRoles(configurator)`
without a configuration callback, when initialization should not enforce an access-role guard.

Multiple `requireRoles` calls accumulate requirements. The method also accepts a builder callback
when the required roles depend on configuration context.

Applications and portal modules can call `enableRoles` without repeating host client
configuration. When a parent framework already has a roles provider, the child reuses that
provider and still checks its own configured role requirements during initialization.

## Show active and claimable roles

The provider resolves the signed-in Fusion account through the auth module:

```ts
const [activeRoles, claimableRoles] = await Promise.all([
  framework.modules.roles.getActiveRoles(),
  framework.modules.roles.getClaimableRoles(),
]);

const canReadReports = await framework.modules.roles.hasRole('Reports.Read');
const canClaimReportReader = await framework.modules.roles.canClaimAccessRole('Reports.Read');
```

`canClaimAccessRole` expands `accessRoleMappings` on the account's claimable assignments and checks
whether activating any claimable role would grant the requested access-role name.

Request and response validation errors from `@equinor/fusion-services` and HTTP request errors
are propagated to the caller.

The built-in client caches active roles, claimable roles, and claim-eligibility results for one
minute through `@equinor/fusion-query`. Concurrent matching reads share the same request.

## Claim a role

```ts
const activation = await framework.modules.roles.claimRole({
  roleId: claimableRoleId,
  reason: 'Support incident response',
  hours: 4,
});
```

A successful claim invalidates every Roles read cache so the next request refreshes active roles,
claimable roles, and claim eligibility.

Before activation, the provider dispatches a cancelable `onRoles.claim` event containing the claim
input. A listener can call `preventDefault()` to stop the Roles V2 request:

```ts
framework.modules.event.addEventListener('onRoles.claim', (event) => {
  if (!mayActivateRole(event.detail.roleId)) {
    event.preventDefault();
  }
});
```

The provider records success events and failure exceptions through the telemetry module. Its
telemetry contains stable operation names and outcomes, but excludes account and role identifiers.

## Supply an internal client without service discovery

```ts
enableRoles(configurator, (builder) => {
  builder.setClient(async () => {
    return createMyRolesClient();
  });
});
```

`RolesModuleConfigurator.setClient` accepts either an `IRolesClient` instance or a builder callback
that resolves one during configuration. It bypasses service discovery for hosts that create their
own account-scoped client, test environments, and custom transports.

This module supports role-aware user interfaces. A trusted backend must still enforce
authorization for protected operations.
