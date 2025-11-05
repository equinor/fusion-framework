---
"@equinor/fusion-framework-react": patch
---

Fix MSAL v4 compatibility in React framework useCurrentUser hook.

- Replace deprecated defaultAccount with account property
- Ensure proper null/undefined handling for account information
- Maintain type safety for AccountInfo return type

This change ensures the React framework hook works correctly with MSAL v4 while maintaining backward compatibility.
