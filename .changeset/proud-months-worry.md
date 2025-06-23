---
---
"@equinor/fusion-framework-module-app": patch
---

Update `AppConfigurator` to verify that `http.hasClient` uses `'apps'` (not `'app'`) as http client name. This change aligns the configuration with the service name provided by service discovery.