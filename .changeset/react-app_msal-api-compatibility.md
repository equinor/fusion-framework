---
"@equinor/fusion-framework-react-app": patch
---

Update React App useToken hook to use new MSAL token acquisition API format.

Internal implementation change to adapt to MSAL interface updates. React App hooks continue to work the same way for consumers.

Why: Ensures compatibility with updated MSAL module API.
