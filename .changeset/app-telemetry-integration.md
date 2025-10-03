---
"@equinor/fusion-framework-app": minor
---

Add telemetry integration to app configurator.

- Add telemetry module dependency to enable telemetry collection
- Configure telemetry in app module configurator with metadata extraction from app manifest
- Add event mapping to prefix configurator events with `AppConfigurator::` namespace
- Set default telemetry scope to `['app']` for app-specific telemetry
- Remove unused ModuleConsoleLogger import in favor of telemetry logging

This enables applications to collect telemetry data from module configuration events and app lifecycle.

resolves: [#3486](https://github.com/equinor/fusion-framework/issues/3486)
