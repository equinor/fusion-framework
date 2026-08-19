---
"@equinor/fusion-framework-docs": patch
---

Align the context module's vue-press documentation with its `docs/` folder: `README.md` now `@include`s the package's own README, and new `docs/{data-model,lifecycle,recipes}.md` pages `@include` the package's own docs pages, matching the `event`/`http` module pattern. The sidebar gains an "Overview"/"Data model"/"Lifecycle"/"Recipes" breakdown for Context, replacing the previous flat link.
