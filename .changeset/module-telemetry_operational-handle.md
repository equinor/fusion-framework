---
"@equinor/fusion-framework-module-telemetry": minor
---

Add one common pattern for wiring operational telemetry into a module.

`createOperationalTelemetry(module)` from `@equinor/fusion-framework-module-telemetry/utils`
returns a handle a provider owns: `connect(provider)` after initialization, `report(...)`
for safe outcomes, and `disconnect()` from teardown. Disconnection is final, so work that
completes after disposal never reports into a torn-down host. A measured report records one
`fusion.<module>.<operation>.duration` metric plus one sanitized failure; a notification
records one event, with an optional `level` that defaults to `Error` for a failure and
`Information` otherwise. Reports never throw, and the module label is validated when the
handle is created.

`TelemetryConnectable` declares the optional `connectTelemetry(telemetry)` provider method
that module descriptors call from `postInitialize`.

```ts
#telemetry = createOperationalTelemetry('reports');
// constructor: this._addTeardown(() => this.#telemetry.disconnect());
connectTelemetry(telemetry) { this.#telemetry.connect(telemetry); }
// module: postInitialize: async ({ instance, modules }) => instance.connectTelemetry?.(modules.telemetry)
```

See "Wire telemetry into a module" in `docs/operational-telemetry.md`.

Ref: #5804.
