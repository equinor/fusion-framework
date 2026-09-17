---
"poc-portal": patch
---

Fix portal bootloader continuing past MSAL's hidden redirect iframe and resolving service discovery before authentication completed, which could send an unauthenticated scoped request. Bootstrap now stops when the window is embedded and the URL fragment carries an MSAL response parameter (`code`, `error`, or `state`).
