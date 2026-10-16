---
"@equinor/fusion-framework-module-app": minor
"@equinor/fusion-framework-react-app": minor
"@equinor/fusion-framework-dev-portal": minor
---

The in-repo app loaders (`useApploader`/`Apploader` and the dev-portal `AppLoader`) now supply `env.navigation` as a `host` initiator, using the parent framework's navigation history and the app basename, so apps using `enableAppNavigation` adopt host navigation without copying `env.basename`. `AppEnv` in `module-app` gains the optional `navigation` field.

`env.basename` is still passed unchanged. Apps that do not call `enableAppNavigation` (legacy `enableNavigation(configurator, env.basename)`) behave as before: a bare `env.basename` is not treated as a strict host constraint.

Tracking: equinor/fusion-core-tasks#2354.
