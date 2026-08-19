---
"@equinor/fusion-framework-cookbook-app-react-module": patch
---

Internal: add Vitest coverage for the `App` component, covering the demo module's resolved `foo`/`bar` values and overriding `configure` to seed a different demo configuration; wires the cookbook into the root Vitest project list via `vitest.config.ts`.

Also fixes `src/config.ts`'s `setBar(() => 69)` — a plain, non-observable return value that `BaseConfigBuilder` silently discarded (logging to `console.error`), so `bar` fell through to the demo module's own 10-second delayed default (`5`) instead of the intended `69`. `setBar(async () => 69)` matches `setFoo`'s existing pattern and resolves immediately.
