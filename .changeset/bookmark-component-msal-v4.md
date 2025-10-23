---
"@equinor/fusion-framework-react-components-bookmark": patch
---

Fix MSAL v4 compatibility in bookmark SharedIcon component.

- Replace deprecated defaultAccount with account property
- Ensure proper account information access for bookmark sharing logic

This change ensures the bookmark component works correctly with MSAL v4 while maintaining backward compatibility.
