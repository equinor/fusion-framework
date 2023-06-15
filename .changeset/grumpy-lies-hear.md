---
'@equinor/fusion-framework-legacy-interopt': patch
---

Changed subscription on fusion framework history

Application had random error with attaching to the Framework history since it was attached by `useEffect`, now changed to `useLayoutEffect`. this error only occurred when resolving initial context, which lead the legacy router in initial path and not the resolved context route.
