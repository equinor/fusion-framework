---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Remove logger level configuration from bootstrap template.

- Removed `configurator.logger.level` assignment from `bootstrap.ts`
- Logger level configuration should be handled elsewhere or is no longer needed

This cleans up the bootstrap template by removing unused logger configuration.
