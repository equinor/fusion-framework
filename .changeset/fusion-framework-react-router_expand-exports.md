---
"@equinor/fusion-framework-react-router": minor
---

Expand re-exports so consumers don't need a direct `react-router` or `react-dom` import.

**New exports from `react-router`:**
- `BrowserRouter`
- `createSearchParams`
- `generatePath`
- `isRouteErrorResponse`
- `type PathParam`
- `type SetURLSearchParams`

**New `Router` prop:**
- `useTransitions?: boolean` — forwarded to `RouterProvider`. Set to `false` to disable React transition wrapping on navigation state updates (workaround for route-change UI flashing).

```tsx
// Disable transitions to suppress route-change flash
<Router routes={routes} useTransitions={false} />
```

Fixes: https://github.com/equinor/fusion/issues/880
Thanks: @edmondbaloku for the report.
