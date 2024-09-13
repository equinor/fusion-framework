---
'@equinor/fusion-framework-module-service-discovery': major
---

The Service Discovery module has been totally revamped to provide a more flexible and robust solution for service discovery in the Fusion Framework.
The module now relies on the Fusion Service Discovery API to fetch services and their configurations, which allows for more dynamic and real-time service discovery.

The module now follows the "best practices" for configuration and usage, and it is now easier to configure and use the Service Discovery module in your applications. But this also means that the module has breaking changes that may require updates to existing implementations.

> [!NOTE]
> This module can still be configured to resolve custom services, as long as the client implements the `IServiceDiscoveryClient` interface.

**Documentation Updates**

-   The README file has been updated to reflect the new configuration options and usage patterns for the Service Discovery module.
-   Added sections for simple and advanced configurations, including examples of how to override the default HTTP client key and set a custom service discovery client.

**Code Changes:**

-   🔨 package.json: Added `zod` as a new dependency for schema validation.
-   💫 api-schema.ts: Added schema for the expected response from the `ServiceProviderClient`
-   💫 client.ts: Created `serviceResponseSelector` for parsing and validating client respons.
-   🔨 client.ts: Updated `IServiceDiscoveryClient` interface to include methods for resolving services and fetching services from the API.
-   🔨 client.ts: Updated `ServiceDiscoveryClient` to use the new `serviceResponseSelector`
-   💫 configurator.ts: Introduced new methods for setting and configuring the service discovery client.
-   🔨 configurator.ts: Updated `ServiceDiscoveryConfigurator` to extend the `BaseConfigBuilder`
-   🔨 configurator.ts: Added error handling and validation for required configurations.

**BREAKING CHANGES:**

-   The type `Service` has deprecated the `defaultScopes` property in favor of `scopes`.
-   The `IServiceDiscoveryClient` interface has been updated, which may require changes in implementations that use this interface.
-   The `ServiceDiscoveryConfigurator` now extends `BaseConfigBuilder`, which will affect existing configurations.
-   The `ServiceDiscoveryProvider.resolveServices` method now returns `Service[]` (previously `Environment`).

> [!NOTE]
> Only the `ServiceDiscoveryProvider.resolveServices` should affect end-users,
> as it changes the return type of the method.
> The other changes are internal and should not affect existing implementations.

**Consumer Migration Guide:**

`defaultScopes` has been replaced with `scopes` in the `Service` type. Update your code to use the new property.

If you are using the `ServiceDiscoveryProvider.resolveServices` method, update your code to expect an array of `Service` objects instead of an `Environment` object.

```typescript
// Before
const { services } = await serviceDiscoveryProvider.resolveServices('my-service');
// After
const services = await serviceDiscoveryProvider.resolveServices('my-service');
```

> [!WARNING]
> The preious `Environment` object had a `clientId` property, which is now removed, since every service can have its own client id, hence the `scopes` property in the `Service` object.

**Configuration Migration Guide:**

> If you are consuming the `@equinor/fusion-framework` and only configuring the http client, no changes are required.

If you are manually enabling the Service Discovery module, update your configuration to use the new methods provided by `ServiceDiscoveryConfigurator`.
Refer to the updated README for detailed configuration examples and usage patterns.

> [!WARNING]
> The `ServiceDiscoveryConfigurator` now extends `BaseConfigBuilder`, which means that the configuration methods have changed.
