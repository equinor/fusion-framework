---
"@equinor/fusion-framework-plugin-context-navigation": patch
---

Respect explicit query context routing when custom path hooks are registered, and only replace a uniquely matching context path segment in the custom fallback.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2264; https://github.com/equinor/fusion-framework/issues/5608