---
"@equinor/fusion-framework-module": minor
---

Add fixed `disposePhase` values (`default`, `diagnostics`, then `events`), typed as the
exported `ModuleDisposePhase`, so ordinary module teardown completes before diagnostic
sinks flush, without arbitrary numeric priorities.
Retain concurrent disposal within each phase. Repeated disposal of one initialized
instance shares a single teardown; disposing another instance from the same
configurator still runs its own hooks. Plugin teardowns are owned by the instance that
registered them, so disposing one instance or rolling back a failed attempt never runs
another instance's plugin cleanup. Infrastructure
phases are reserved for diagnostic/event providers, not ordinary module dependency ordering.
Emit measured host/module lifecycle outcomes. A failed startup still rejects with the
first failure without waiting for slower initializers; providers that succeeded are
cleaned up, including those that finish after the rejection.
Startup rollback only cleans up providers created by that initialization attempt,
using the same provider map rather than a configurator-wide registry.

Allow `addConfig({ module, configurator, configure })` to register an explicitly
created configuration builder. The configure phase uses that exact object instead
of invoking the module factory, while retaining normal lifecycle hooks and additive
configuration callbacks. Add a synchronous `prepare` callback during registration,
using a supplied builder or an opt-in, reference-independent `module.prepare()`
factory. The orchestrator creates and reuses configuration internally; no public
builder lookup is exposed. Preparation completes before registration returns,
rejects async work and emits failure events without invoking ordinary factories early.
A failed preparation leaves the previous registration for that module untouched.
Replacing a prepared registration with a different descriptor of the same name, for
example from a duplicate package copy, emits a `module.preparedConfigReplaced` warning
event and a console warning instead of discarding the prepared builder silently.

Export `markTelemetryExportRequest(init)` and the `telemetryExportRequest` symbol to
identify exporter-owned requests through shared HTTP middleware. Operational
instrumentation skips its own telemetry delivery without hiding unrelated requests;
no marker header is transmitted.

Ref: #5803.
