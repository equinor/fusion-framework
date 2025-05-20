---
'@equinor/fusion-framework-module': patch
---

Fix: Improve error handling and logging in module initialization and post-initialization.

- Improved error logging when `_initialize` fails
- Ensure that error is piped to subscribe of `_initialize` when errors occurs
