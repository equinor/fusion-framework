---
"@equinor/fusion-framework-cli": patch
---

Send service discovery to the mock server whenever mock authentication is enabled.

Previously `FUSION_SPA_MSAL_MOCK=true` (from the environment or a `.env` file) only switched the SPA to unsigned mock tokens, while `ffc app dev` and `ffc app serve` kept forwarding service discovery to the real CI environment. Every page load — for example in a Playwright suite — sent a mock token to `discovery.fusion.equinor.com` and failed with `401`.

Mock auth now implies mock discovery, exactly like `--mock`: the dev server uses `FUSION_SPA_MSAL_MOCK_SERVER_URL`, or `http://localhost:4010` when only `FUSION_SPA_MSAL_MOCK` is set. `--mock` still takes precedence. Start the mock server with `ffc mock-server` before running the app.
