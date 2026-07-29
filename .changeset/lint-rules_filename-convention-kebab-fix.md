---
"@equinor/fusion-framework-lint-rules": patch
---

Fix `filenameConvention`'s kebab-case conversion to correctly handle `SCREAMING_SNAKE_CASE` constants (e.g. `EVENT_NAME` no longer suggests the invalid `event_name.ts`, but `event-name.ts`), leading-underscore "private" export names (e.g. `_routerContext` keeps its underscore prefix instead of producing a malformed `-router-context.ts`), and destructuring exports (e.g. `export const { Consumer, Provider } = ctx`), which are now skipped since there's no single export name to file the module after.
