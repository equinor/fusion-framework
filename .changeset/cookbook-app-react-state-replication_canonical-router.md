---
"@equinor/fusion-framework-cookbook-app-react-state-replication": patch
---

Use the framework's canonical `Router` component from `@equinor/fusion-framework-react-router` instead of the deprecated `useRouter`/`RouterProvider` interop pattern, matching the `app-react-router` cookbook. This also resolves a `react-router`/`@remix-run/router` type mismatch surfaced by `tsc -b`.
