---
"@equinor/fusion-framework-cookbook-app-react-ai": patch
---

Internal: remove a `@ts-expect-error` in `createFusionSearchTool` that no longer suppresses an error, so the cookbook type-checks on its own.

refs equinor/fusion-core-tasks#1626
