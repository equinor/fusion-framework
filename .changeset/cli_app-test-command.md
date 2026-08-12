---
"@equinor/fusion-framework-cli": minor
---

Add `ffc app test` command, running the application's own Vitest suite with its manifest, config, and module-configurator resolved and exposed to `@equinor/fusion-framework-react-app/vitest`'s `test`/`render` fixtures with zero per-test wiring — the same resolution `ffc app build`/`ffc app dev` already do.

```sh
ffc app test
ffc app test --watch
ffc app test --manifest ./app.manifest.local.ts --config ./app.config.ts
```
