---
"@equinor/fusion-framework-module": patch
---

Fix a bug in the module configurator that caused configurator phases (configure / post-initialize / dispose) to run out of order or skip post-configure hooks in certain initialization paths.

This ensures module configuration and plugin hooks run reliably during module initialization, preventing missed setup steps for consumer modules.

Fixes: restores correct configurator phase ordering and prevents lost initialization for modules that rely on post-configure hooks.
