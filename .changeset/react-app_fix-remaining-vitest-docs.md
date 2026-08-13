---
"@equinor/fusion-framework-react-app": patch
---

Remove `docs/testing.md` and replace the README's testing section with a pointer to `@equinor/fusion-framework-vitest-plugin-react-app`, now that `renderAppHook`, `renderAppComponent`, `testApp`, and the `appTestVitePlugin` Vite plugin live in that separate package instead of this one. Both described the old `./vitest` entry-point as requiring `@testing-library/react` and returning a top-level `modules` field, which no longer applies now that the helpers are built on `vitest-browser-react` and return a nested `fusion: { framework, app }` object. The README's API-reference table no longer lists a `/vitest` entry-point.
