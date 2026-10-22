---
"poc-portal": patch
---

Internal: make the cookbook type-check on its own. `rootDir` now includes `app.config.ts`, and the bootloader uses the current module APIs: `configureMsal` takes a configure callback, and the removed `ModulesConfigurator.logger` setting is gone.

refs equinor/fusion-core-tasks#1626
