---
"@equinor/fusion-framework-cookbook-app-react-people": patch
---

Internal: resolve `fusion-lint` warnings across the cookbook (`single-export-per-file`, `require-tsdoc`, `require-intent-comment`). Split `Router.tsx` into `AppRouter.tsx`, `person-search.ts` into `search-person.ts` plus a new `useSearchPersons` hook, and `Styled.tsx` into `flex-grid.ts`/`flex-grid-column.ts`. Fixed `AvatarPage.tsx` to import `FlexGrid` from the new `flex-grid.ts` location. No behavior change.
