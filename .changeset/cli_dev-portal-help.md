---
"@equinor/fusion-framework-cli": minor
---

The dev portal served by `ffc app dev` and `ffc app serve` now opens a help side sheet when an app calls `useHelpCenter()`. The sheet shows articles from local help docs served by `ffc mock-server`, with a browsable sidebar and a simple search. Use it to verify help wiring and content locally and in Playwright before release.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2149
