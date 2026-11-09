---
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
---

Internal: wait up to 30 seconds for the routed page to render before waiting for its `page-viewed` analytics event, and cap each Playwright test at 45 seconds. `page.goto` resolves before the app has loaded, so slow CI runners spent the analytics wait on app startup and timed out.
