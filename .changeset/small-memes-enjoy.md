---
"@equinor/fusion-framework-module-msal-node": patch
---

added lazy loading of msal cache to prevent required libsec to be loaded when not needed. CI/CD only uses tokens
