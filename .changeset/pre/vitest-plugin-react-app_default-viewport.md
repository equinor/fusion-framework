---
"@equinor/fusion-framework-vitest-plugin-react-app": minor
---

`defineProject` now defaults `test.browser.viewport` to `1024x768` instead of Vitest's own
mobile-sized default, matching the low, fixed resolution most Fusion apps see in production
through Citrix. Pass `test.browser.viewport` to `defineProject` to use a different size.
