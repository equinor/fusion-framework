---
"@equinor/fusion-framework": minor
---

Add a `./mock` entry point for initializing the framework in a test.

```typescript
import { mockFramework } from '@equinor/fusion-framework/mock';

const fusion = await mockFramework();
```

`mockFramework` runs the real configure → initialize pipeline with the real built-in modules and substitutes only the boundaries that leave the process — the MSAL client and the service discovery client. Module wiring, configuration validation and lifecycle hooks behave as they do in production, so a test still catches wiring mistakes that a hand-built replacement for the module graph would hide.

It takes a single callback receiving a `FrameworkMockConfigurator`, which **is** a `FrameworkConfigurator`. Modules whose boundary is mocked expose their own configurator as a property, so a test configures them without registering a callback:

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
  configurator.serviceDiscovery.addService({ key: 'my-api' });
});
```

Because it is a real configurator, every `enableX` helper an application already uses accepts it unchanged — including the ones a team writes for their own modules. Those modules can be passed as a type argument so they are typed on the configurator *and* on the resulting `fusion.modules` without a cast:

```typescript
const fusion = await mockFramework<[InvoiceModule]>((configurator) => {
  enableInvoicesMock(configurator, { total: 42 });
});

await fusion.modules.invoices.getInvoice('inv-1'); // typed
```

`FrameworkMockConfigurator` is also exported for tests that need to hold on to the configurator and call `init` themselves.

The entry point owns no mock logic. Each module exports its own test double from its own `./mock` entry point, and this one composes the built-in set; an application module follows the same pattern and plugs in without any support from this package. It has no test-runner dependency and provides no mocking API, because replacing an individual call belongs to your test runner.
