---
"@equinor/fusion-framework-app": patch
---

Add telemetry integration to app configurator.

- Add event$ observable with app-specific event prefixing
- Enable telemetry in app module configuration
- Include app metadata (appKey, version) in telemetry collection
