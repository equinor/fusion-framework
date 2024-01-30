---
"@equinor/fusion-framework-react": major
---

refactor framework feature flag hooks

- useCurrentAppFeatures
- _useFeature (internal)_
- _useFeatures (internal)_
- useFrameworkFeature
- useFrameworkFeatures

> [!CAUTION]
> `useCurrentAppModules` does no longer return `Observable<AppModulesInstance>`, but current state of `AppModulesInstance | null`
