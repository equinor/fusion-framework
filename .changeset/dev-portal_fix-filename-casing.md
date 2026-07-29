---
"@equinor/fusion-framework-dev-portal": patch
---

Internal: remove duplicate git-tracked files that differed only in filename casing (`BookMarkSideSheet.tsx`/`BookmarkSideSheet.tsx` and `PersonSideSheet/sheets/Styled.tsx`/`styled.tsx`). Both pairs had identical content; only the casing actually referenced by imports is kept. This was invisible on case-insensitive filesystems but broke builds on case-sensitive ones (`TS1149`). No behavior change.
