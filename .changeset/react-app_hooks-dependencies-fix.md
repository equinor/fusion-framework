---
"@equinor/fusion-framework-react-app": patch
---

Fix React hooks dependency arrays in useHelpCenter to prevent exhaustive dependencies linting errors.

Changed dependency arrays from `[eventModule.dispatchEvent]` to `[eventModule]` in all useCallback hooks to properly track all dependencies used within the callbacks.
