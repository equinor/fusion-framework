---
'@equinor/fusion-framework-module-bookmark': minor
---

- Exposed the `IBookmarkProvider` interface and updated references.
- Improved handling of the parent provider in `BookmarkProvider`.
- Fixed `BookmarkProvider.on` to only emit when the source of the event is the provider.
- Refactored `BookmarkProvider.generatePayload` to better handle the creation and update of bookmark payloads.
- Ensured all observable executions to the API are terminated after the first successful or failed response.
