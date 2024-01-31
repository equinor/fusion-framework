---
"@equinor/fusion-framework-react": patch
---

- The return type of the `useCurrentApp` function has been changed. The `currentApp` property can now be `undefined` or `null`, in addition to `CurrentApp<TModules, TEnv>`.
- The initial value for `useObservableState` has been set to `provider.current`.

- The assignment of `module` has been updated to handle the case where `modules` is `undefined`.

- The return type of the `useCurrentAppModules` function has been changed. The `modules` property can now be `undefined` or `null`, in addition to `AppModulesInstance<TModules>`.
- The initial value for `useObservableState` has been updated to handle the case where `currentApp` is `undefined`.
