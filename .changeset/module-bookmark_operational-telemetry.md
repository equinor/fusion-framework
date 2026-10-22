---
"@equinor/fusion-framework-module-bookmark": minor
---

Report bookmark operations through host telemetry. The provider records one
`fusion.bookmark.<operation>.duration` outcome for `get`, `list`, `apply`, `create`,
`update`, `delete`, `favourite-add`, `favourite-remove` and `payload-resolve`.
Create, update and delete are measured from the call, because they start
immediately, whether or not the caller subscribes. A listener canceling the matching
event is recorded as `cancelled` with reason `listener`, not as a failure; operations
interrupted by disposal are `cancelled` with reason `disposed`. Bookmark names, ids,
payloads and error messages are never included.

Custom providers opt in through the optional `IBookmarkProvider.connectTelemetry`
method. Bookmark results, errors and event cancellation behave as before.

Ref: #5805.
