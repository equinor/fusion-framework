---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Add a "Migrate an existing app" guide (`docs/migrating-an-existing-app.md`) covering how to
move a suite from `@testing-library/react`/jsdom/happy-dom onto this package: installing
Browser Mode, replacing hand-rolled `vi.mock`s of Fusion hooks with each module's `enable*Mock`
entry point, porting a hand-written mock HTTP server to `createRouterMiddleware`, composing a
router fixture with a domain-state fixture in one file, and updating renders/assertions to the
async `vitest-browser-react` API. Linked from the package README and from
`docs/overview.md` and `testing-choosing-a-layer.md`.
