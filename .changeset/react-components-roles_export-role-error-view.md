---
"@equinor/fusion-framework-react-components-roles": minor
---

Export `RoleErrorView` and `RoleErrorViewProps`.

`RoleErrorView` is the built-in missing-access-role recovery that `AccessRoleBoundary` already renders. Route error elements can now reuse it for `requireRoles` denials:

```tsx
const recovery = useRequireRolesRecovery(error);
if (recovery && error instanceof Error) {
  return <RoleErrorView error={error} onRetry={recovery.retry} />;
}
```

It calls `onRetry` only after the user activated a claimable role assignment, and renders nothing for errors without a `RequiredAccessRolesError` in their cause chain.
