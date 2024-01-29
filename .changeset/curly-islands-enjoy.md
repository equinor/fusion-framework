---
"@equinor/fusion-framework-react-app": minor
---

refactor hook for accessing feature flags

> [!IMPORTANT]
> the `useFeature` hook look for flag in parent **(portal)** if not defined in application scope

> [!CAUTION] > `@equinor/fusion-framework-react-app/feature-flag` will only return `useFeature`, since we don not see any scenario which an application would need to access multiple.
> We might add `useFeatures` if the should be an use-case
