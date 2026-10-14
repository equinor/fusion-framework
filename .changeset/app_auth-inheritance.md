---
"@equinor/fusion-framework-app": patch
---

Clarify that ordinary portal-hosted apps, including Roles V2 consumers, inherit portal authentication through the app bootstrap's default MSAL registration and version-compatible parent proxy. Add real Roles-client regression coverage for inherited auth, custom-provider precedence, account switching and sign-out; runtime behavior is unchanged.

Refs #5723.
