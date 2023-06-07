---
'@equinor/fusion-framework-legacy-interopt': patch
---

**Prevent app registration death spiral**

Currently the application can register it self with a shared function in the fusion context (window), this modifies the manifest. if the portal and application has different app containers _(which they do if application bundle with a different version of fusion-api than the fusion-cli 🤯)_.

The 2 containers are connected threw a message bus and localStorage, which batch on `requestAnimationFrame`, which means that if there are miss-match between the application manifests, this would do a tic-toc as fast as your computer can render🧨

after this update only a few manifest properties will be checked:
- `render`
- `AppComponent`
- `tags`
- `category`
- `publishedDate`

> we suggest that application ony register `appKey` plus `render` or `AppComponent` _(☠️ deprecated soon)_
> ```ts
>registerApp('my-app', {render: myRenderMethod})
>```