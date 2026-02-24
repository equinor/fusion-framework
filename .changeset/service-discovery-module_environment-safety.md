---
"@equinor/fusion-framework-module-service-discovery": patch
---

Fix service discovery session overrides to work safely in non-browser environments.

Previously, the module would throw errors when trying to access `sessionStorage` in environments where it's not available (like Node.js). The module now checks if `sessionStorage` is available before attempting to access it, preventing runtime errors and making the module more resilient across different runtime environments.

Also includes comprehensive documentation for the session overrides feature, explaining how to set up and use session-based service URL overrides for development and debugging purposes.

Closes [#372](https://github.com/equinor/fusion-core-tasks/issues/372)