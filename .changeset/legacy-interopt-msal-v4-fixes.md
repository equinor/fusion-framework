---
"@equinor/fusion-framework-legacy-interopt": patch
---

Fix MSAL v4 compatibility issues in legacy interopt LegacyAuthContainer.

- Replace deprecated defaultAccount with account property
- Update login calls to use MSAL v4 request structure
- Fix handleRedirect usage to match MSAL v4 API
- Ensure proper async/await patterns for authentication flows

These changes ensure legacy interopt works correctly with MSAL v4 while maintaining backward compatibility for legacy applications.
