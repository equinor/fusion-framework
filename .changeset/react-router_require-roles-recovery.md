---
"@equinor/fusion-framework-react-router": minor
---

Add access recovery for `requireRoles` denials.

`useRequireRolesRecovery(error)` returns `{ operation, status, retry }` for a `denied` error and `undefined` for other errors. Pass `retry` to `RoleErrorView` from `@equinor/fusion-framework-react-components-roles` as `onRetry`, so it runs only after the user activated a role.

```tsx
const error = useRouteError();
const recovery = useRequireRolesRecovery(error);
if (recovery && error instanceof Error) {
  return <RoleErrorView error={error} onRetry={recovery.retry} />;
}
```

- `retry` checks again with `refresh: true`. It re-runs the denied operation only when access is granted and the router still shows that denial.
- Denied navigations reload the current location. Denied form submissions are submitted once more, so `useActionData` receives the result.
- Retries are single-flight and replay at most once. They are cancelled when the error element unmounts, and never cross `Router` instances.

Add `useRequireRolesFetcherRecoveries()` for denied fetcher loads and submissions.

While a host is mounted, a denied fetcher execution is held instead of failed. The owner stays mounted with the same fetcher key, for unkeyed and keyed fetchers. After activation, `hold.retry()` checks again with `refresh: true` and resumes the original execution once, so `fetcher.data` reaches every consumer of the key.

```tsx
const holds = useRequireRolesFetcherRecoveries();
return holds.map((hold) => (
  <RoleErrorView key={hold.id} error={hold.error} onRetry={() => void hold.retry()} />
));
```

- `dismiss()` shows the denial at the owner's error boundary.
- A resubmitted fetcher, a navigation away from the owner's route, the last host unmounting, or the `Router` unmounting each end the hold without running it.
- Without a host, denied fetcher executions fail at the owner's error boundary, and no recovery is offered.
- `Router` now records which `navigate` or `fetch` call started each middleware execution, and provides its recovery scope to fetcher hosts.

The documented static-recognition contract for build tools now matches the route manifest design. `requireRoles` arguments may use literals or `const` bindings declared in the same module. A recognised call whose arguments cannot be resolved must fail publication with a file and field diagnostic, instead of becoming `{ kind: 'custom' }`.
