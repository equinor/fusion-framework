---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Add a "Why Browser Mode is the default" guide (`docs/why-browser-mode.md`) explaining
the rationale for defaulting to real Chromium over DOM emulation (the documented React 19 peer
dependency crash in the previous renderer, plus the framework's real-module testing philosophy),
the actual performance tradeoff (a real browser is slower, not faster — this was a fidelity
choice, not a speed optimization), and how to bring your own renderer for a single test file by
composing `mockFramework`/`mockAppModules`/`FrameworkProvider`/`ModuleProvider` directly with a
different render function (e.g. `@testing-library/react` on `happy-dom`). Linked from the
package README and `docs/overview.md`.
