---
'@equinor/fusion-framework-app': minor
---

Removed the functionality for configuring MSAL in an application, since the ancestor should provide an instance for the application to use.

This is not a breaking change, but a warning will be logged if the application tries to configure MSAL.
