---
"@equinor/fusion-framework-cli": patch
---

`ffc app dev`, `ffc app serve`, and `ffc portal dev` add `X-Fusion-Mock: true|false` to every request the dev server proxies upstream, so upstream telemetry shows whether the caller ran with mock authentication.
