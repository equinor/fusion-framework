---
"@equinor/fusion-lint": minor
---

Initial release of `@equinor/fusion-lint` CLI.

Provides the `fusion-lint` command for running Fusion Framework lint rules from the terminal or CI:

```sh
pnpm exec fusion-lint lint src/
pnpm exec fusion-lint changed      # lint only git-changed .ts/.tsx files
```

Outputs GitHub Actions annotations (`::warning` / `::error`) when running in CI.
