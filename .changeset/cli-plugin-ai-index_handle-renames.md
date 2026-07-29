---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Fix `getChangedFiles` to correctly handle renamed files in `--diff` mode. Previously, renamed files (`git diff --name-status` status `R###`) were silently skipped, so renamed files were never picked up for re-indexing. Renames are now treated as a removal of the old path plus an addition of the new path.
