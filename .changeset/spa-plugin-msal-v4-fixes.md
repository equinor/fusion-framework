---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix MSAL v4 compatibility issues in SPA plugin.

- Update MSAL client configuration to use nested auth object structure
- Replace deprecated defaultAccount with account property
- Update acquireToken calls to use MSAL v4 request structure

These changes ensure the SPA plugin works correctly with MSAL v4 while maintaining backward compatibility.
