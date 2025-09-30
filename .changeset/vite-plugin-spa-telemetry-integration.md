---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Add comprehensive telemetry integration to SPA bootstrap and service worker.

- Enable telemetry in SPA bootstrap with ConsoleAdapter
- Track bootstrap performance for portal loading operations
- Monitor service worker registration and token acquisition
- Include user metadata and portal configuration in telemetry
- Track exceptions and errors throughout SPA lifecycle
