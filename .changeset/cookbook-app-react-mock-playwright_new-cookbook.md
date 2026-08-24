---
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
---

Add a cookbook demonstrating Fusion Framework end-to-end testing with `@playwright/test`
against `ffc mock-server`. Playwright's `webServer` starts both the mock server and `ffc app
dev --mock`, which discovers the mocked services and creates local proxy routes automatically.
Component field and path overrides keep the example deterministic while remaining replaceable
through the mock server's per-test HTTP control plane.
