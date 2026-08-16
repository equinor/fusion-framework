# Design

Why this entry point exists, what it substitutes, and the rules that keep it from growing into a mocking library.

## Why this exists

Fusion Framework cannot start without authenticating a user and resolving services from a registry. Both reach outside the process, so an application test either has to supply real credentials or hand-build a replacement for every built-in module.

This entry point removes that work. It runs the **real** configure → initialize pipeline with the **real** built-in modules, and substitutes only the boundaries that leave the process.

That distinction matters: module wiring, configuration validation and lifecycle hooks behave exactly as they do in production, so a test still catches wiring mistakes.

## How mocks are organised

> [!IMPORTANT]
> This entry point contains **no mock logic**. Every module owns and exports its own test double from a `./mock` entry point. This entry point only composes the built-in set.

```
@equinor/fusion-framework-module-msal/mock               -> enableMsalMock
@equinor/fusion-framework-module-service-discovery/mock  -> mockServiceDiscovery
@equinor/fusion-framework/mock                           -> composes the above
```

Three consequences follow, and they are the reason for the split:

- **Mocks cannot drift.** A test double lives beside the implementation it stands in for, so a change to the real interface breaks it in the same package, in the same build.
- **Mocks version with their module.** Installing msal `v10` gets msal `v10`'s mock. There is no version matrix to reconcile.
- **Application modules work the same way.** A team's own module exposes its own mock entry point and composes without this entry point knowing it exists.

Adding mock support to another Fusion module means adding a `src/mock/` folder to that module — not editing this entry point.

## What is actually substituted

> [!IMPORTANT]
> Only the **client** — the object that performs network I/O — is replaced. Providers, configurators, schema validation and module `initialize` are all real.

For authentication this means `MsalProvider` itself runs. A test therefore observes real provider behaviour, including decisions the provider makes on the caller's behalf:

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.msal.setClientConfig({ auth: { clientId: 'my-app', tenantId: 'my-tenant' } });
});

const token = await fusion.modules.auth.acquireAccessToken();
// scope is 'my-app/.default' — resolved by the real provider, not by the test double
```

A double that replaced the provider would have skipped that logic and quietly reported whatever it was told to.

## Determinism

Tokens and resolved services are identical across runs and across machines. `createMockToken` uses a fixed issue time, so a token can be compared or snapshotted directly.

## Test-runner support

The package has **no test-runner dependency**. It builds a real framework instance and returns it; assertions are the caller's concern. It works under Vitest today and would work unchanged under another runner.

`vitest` appears only in `devDependencies`, for this entry point's own tests.

> [!IMPORTANT]
> This is deliberate, and it is why there is **no Fusion mocking API**. The framework's job is making the runtime *substitutable* — a real configurator that validates, an I/O-boundary client that needs no network or credentials, a registry you compose on the builder. Replacing an individual call is your runner's job, and it does it better: call assertions, argument matchers and reset semantics you already know.
>
> Mock clients are therefore plain classes with ordinary methods. `vi.spyOn`, `bun:test`'s `spyOn` and Node's `t.mock.method` all work on them directly.
