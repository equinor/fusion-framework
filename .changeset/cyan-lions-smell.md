---
"@equinor/fusion-observable": patch
---

fix linting

when using `React.useCallback` inside another hook, the callback function cant resolve input type of callback.

https://github.com/equinor/fusion-framework/blob/ddc5bdbc0e0f8c61affb66631fe59366785ee474/packages/utils/observable/src/react/useObservableRef.ts#L15-L18
