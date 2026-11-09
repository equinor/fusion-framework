---
"@equinor/fusion-framework-cookbook-app-react-roles": patch
---

Internal: give the Playwright test that starts two role personas side by side up to 40 seconds for both apps to load, and mark it slow. Starting two portals in parallel took longer than the 20-second readiness wait on Windows CI runners. Other tests keep the 20-second wait.
