---
'@equinor/fusion-framework-cli': minor
---

Added functionality for allow providing paths for `config`, `manifest` and bundle in `app-proxy-plugin`. This is useful for plugins that need to load resources from a specific path.

This was required since the AppClient was changed in [#2520](https://github.com/equinor/fusion-framework/pull/2520) which broke the ability to load resources from the plugin.
