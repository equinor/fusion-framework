---
"@equinor/fusion-framework-react-app": patch
---

Fix MSAL v4 compatibility issues in React app hooks.

- Update useCurrentAccount to use account property instead of deprecated defaultAccount
- Fix useToken hook to properly handle AcquireTokenResult type
- Ensure proper null/undefined handling for account information

These changes ensure React app hooks work correctly with MSAL v4 while maintaining backward compatibility.
