---
"@equinor/fusion-framework-vitest-plugin-react-app": minor
---

`resolveFusion` (and both the `/test` fixtures and `testApp`) now enable the feature-flag
mock by default, with no flags enabled, so `useFeature` needs no `localStorage` or URL
seeding in tests.

`@equinor/fusion-framework-module-feature-flag` is an optional peer dependency: the mock is
only wired up when the package is actually installed, so apps that don't use feature flags
aren't forced to add it. Install it to get the default mock; call `enableFeatureFlagMock`
again inside `configureFusion` to seed specific flags.
