# Service Discovery API Reference

## Exports

| Export                             | Kind          | Description                                                    |
| ---------------------------------- | ------------- | -------------------------------------------------------------- |
| `enableServiceDiscovery`           | function      | Registers the module on a `ModulesConfigurator` (recommended)  |
| `configureServiceDiscovery`        | function      | Creates an `IModuleConfigurator` for manual `addConfig` usage  |
| `ServiceDiscoveryConfigurator`     | class         | Builder for service discovery configuration                    |
| `ServiceDiscoveryProvider`         | class         | Runtime provider — resolves services, creates HTTP clients     |
| `IServiceDiscoveryProvider`        | interface     | Public API contract for the provider                           |
| `IServiceDiscoveryClient`          | interface     | Contract for pluggable discovery client implementations        |
| `Service`                          | type          | Shape of a resolved service endpoint                           |
| `ServiceDiscoveryConfig`           | interface     | Resolved module configuration holding the discovery client     |
| `ServiceDiscoveryModule`           | type          | Module type alias for the framework module system              |

## `Service` Shape

```typescript
type Service = {
  key: string;         // Lookup key (e.g. "context")
  uri: string;         // Base URI of the service
  scopes?: string[];   // OAuth scopes
  id?: string;         // Service registration ID
  name?: string;       // Display name
  tags?: string[];     // Freeform tags
  overridden?: boolean; // True when session-overridden
  defaultScopes: string[]; // @deprecated — use `scopes`
};
