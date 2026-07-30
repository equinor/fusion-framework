---
"@equinor/fusion-framework-react-router": minor
---

Re-export `useBlocker` and `useBeforeUnload` from `react-router` so consumers migrating from `react-router-dom` don't need a direct dependency on `react-router` for these hooks.

Thanks @edmondbaloku

Closes: https://github.com/equinor/fusion/issues/888
