---
"@equinor/fusion-framework-module-ag-grid": patch
---

Fix AG Grid theme initialization crash in mixed v34/v35 runtime scenarios where shared style state can trigger `grids.add is not a function`.

Adds compatibility shimming for the shared AG Grid style injection state so Set-like and Map-like access patterns can coexist when bundles from different AG Grid versions are loaded on the same page.

Related: https://github.com/equinor/fusion-core-tasks/issues/388
