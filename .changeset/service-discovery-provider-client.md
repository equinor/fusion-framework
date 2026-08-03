---
"@equinor/fusion-framework-module-service-discovery": minor
---

Expose the discovery client on the provider as `client`, mirroring `MsalProvider.client`.

Resolution already went through `config.discoveryClient`, but reaching it required knowing the config shape. A stable accessor gives tests a target their own test runner can spy on, and gives application code a way to inspect the client without depending on the configuration layout.

```ts
vi.spyOn(fusion.modules.serviceDiscovery.client, 'resolveService').mockResolvedValue(service);
```
