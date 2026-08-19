---
"@equinor/fusion-framework": minor
---

Add `_pin` and `_getConfig` to `FrameworkMockConfigurator`, so a module supplied through `TModules` can get the same kind of named accessor `.msal` and `.serviceDiscovery` already have.

Previously that pinning was hand-written twice, once per built-in mock, with no way for anything else to do the same. A subclass now reuses it directly:

```typescript
class AppMockConfigurator extends FrameworkMockConfigurator<[InvoiceModule]> {
  constructor() {
    super();
    this._pin(invoiceMockModule);
  }

  get invoices(): InvoiceMockConfigurator {
    return this._getConfig('invoices');
  }
}
```

`_pin(module)` replaces the module's own `configure` factory with one that always returns the same instance, and registers it — pinning it before initialization runs is what lets a test reach the accessor synchronously and have it be the configurator the module is actually built from. `_getConfig(name)` looks that instance up by the module's name, throwing if nothing was pinned for it.

`.msal` and `.serviceDiscovery` are unchanged for consumers; they are now built from `_pin`/`_getConfig` themselves rather than from two private fields.
