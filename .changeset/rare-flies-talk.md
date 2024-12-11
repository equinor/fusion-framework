---
'@equinor/fusion-framework-module-services': patch
---

Fixed `isBookmarkInFavorites` by altering `generateRequestParameters` which had a copy paste bug (wrong request method). Also disabled the `validate_api_request` response operation for now, it was throwing an error on all response code which waas not **OK**.

> in a future update, the `ResponseHandler` will provide the operators with the `Request` object, so they can access the request method and other request properties.

Also fixed the `headSelector` to only check response code, since a `HEAD` request does not return a body.
