---
"@equinor/fusion-framework-legacy-interopt": patch
---

added missing [exhausted-deps](https://legacy.reactjs.org/docs/hooks-rules.html), this might cause rerender, since `ReactRouterDom.createBrowserHistory` might create history dynamicly.

this should be tested in portal when updating the `@equinor/fusion-framework-legacy-interopt`

https://github.com/equinor/fusion-framework/blob/7c0a475174f61ba02570614c237d5cfb3b009cb1/packages/react/legacy-interopt/src/create-legacy-render.tsx#L59
