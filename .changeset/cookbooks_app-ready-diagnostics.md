---
"@equinor/fusion-framework-cookbook-app-react-context": patch
"@equinor/fusion-framework-cookbook-app-react-roles": patch
---

Internal: wait up to 20 seconds for mounted cookbook UI before Playwright feature assertions, cap each test at 45 seconds, probe the served SPA bootstrap module, and retain failure traces, screenshots, and HTML reports. No retries are added.
