---
"@equinor/fusion-framework-module-msal": minor
---

Extract client construction from `MsalConfigurator._processConfig` into overridable seams.

`_processConfig` now only decides *whether* a client is needed; `protected _createClient(config, init)` decides *what* to build, and `protected _createClientConfig(config)` resolves the `MsalClientConfig` it is built from — authority derived from the tenant, cache location, telemetry-backed logging and cache lookup policy included.

Behaviour is unchanged for consumers: the client is still auto-created from `setClientConfig`, and a client supplied through `setClient` still wins, because `_createClient` is consulted only when no client was set.

This gives a supported seam for authenticating through something other than Entra ID:

```typescript
class MyConfigurator extends MsalConfigurator {
  protected override async _createClient(config: MsalConfig): Promise<IMsalClient> {
    // same fully resolved configuration the real client is built from
    return new MyOwnMsalClient(this._createClientConfig(config));
  }
}
```

Overriding it replaces only the client, leaving the builder, the schema validation and `MsalProvider` untouched.

No client is built when the module is hoisted onto a host application's provider — an app running inside a portal authenticates through the host, so a client built during configuration would be discarded, or worse, shadow the host's signed-in user. `protected _isHoisted(init)` exposes that decision to subclasses.

Also adds `getClientConfig()`, the counterpart to `setClientConfig`, so a subclass can tell "nothing was declared" apart from "declared, and here it is".

`_createClientConfig` applies its defaults to a copy of the declared configuration, not the object itself, so a caller reusing or asserting on it never sees it rewritten, and a shared constant can be used as a default without one configurator's client contaminating the next.
