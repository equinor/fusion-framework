---
"@equinor/fusion-framework-dev-portal": patch
---

Add telemetry module integration to dev portal. This enhances the dev portal's monitoring capabilities by:
- Adding telemetry module as a dependency
- Integrating it into the portal configuration with proper scoping
- Setting portal-specific metadata with version and name
- Configuring event forwarding from configurator

Removed:
- Debug console logging statements
- Commented out code in bookmark builder configuration
- Console log for framework configuration completion
