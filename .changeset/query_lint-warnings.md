---
"@equinor/fusion-query": patch
---

Internal: resolve remaining `fusion-lint` warnings across the package (TSDoc, intent comments, `filename-convention`, `single-export-per-file`). Renames `src/events.ts` → `src/QueryEvent.ts`, `src/cache/events.ts` → `src/cache/QueryCacheEvent.ts`, and `src/client/events.ts` → `src/client/QueryClientEvent.ts`. Splits `src/operators.ts` into a directory (`src/operators/{concat-queue,merge-queue,switch-queue,query-value}.ts` + barrel `index.ts`) and `src/client/flows.ts` into `src/client/{handle-requests,handle-execution,handle-failure}.ts`. Renames `src/client/reducer.ts` → `src/client/create-reducer.ts`. No public API or behavior change.
