---
'@equinor/fusion-framework-cli': patch
---

cli should no use provided config when developing an application which exists in Fusion App Service.

> when dev proxy server did not get 404 when requesting application config, it provided the manifest instead of config file path
