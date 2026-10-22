---
"@equinor/fusion-framework-cookbook-app-react-router": patch
---

Fix the TypeScript errors reported when type-checking the React Router cookbook on its own (`tsc -b`):

- Tests use a shared `test` fixture that types `app` with the navigation module, so `app.navigation` is typed without casts.
- `PeoplePage` types `actionData` as `{ error: string } | undefined`, which is its value before any form submission.
- Error elements narrow the `unknown` route error with `instanceof Error` before reading `message` or `stack`.
- `fwc-markdown-viewer` is registered on `React.JSX.IntrinsicElements`, which React 19 uses for type-checking.
- `RouterHandle` declares the optional `navigation.path` override that the sidebar reads.
- The middleware demo routes annotate their `middleware` exports as `MiddlewareFunction[]`, so their types no longer depend on React Router's internal paths (TS2883).
- Removed a `@ts-expect-error` that no longer suppresses an error.
- Removed the `src/**/*.{test,spec}.{ts,tsx}` exclude from `tsconfig.json`. TypeScript doesn't support `{a,b}` globs, so it never excluded anything; test files stay type-checked, as in the other cookbooks.

refs equinor/fusion-core-tasks#1626
