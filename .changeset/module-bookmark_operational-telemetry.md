---
"@equinor/fusion-framework-module-bookmark": minor
---

Report bookmark operations through host telemetry. The provider records one
`fusion.bookmark.<operation>.duration` outcome for `get`, `list`, `apply`, `create`,
`update`, `delete`, `favourite-add`, `favourite-remove` and `payload-resolve`.
Create, update, delete, `get` (bookmark metadata) and `payload-resolve` are measured
from the call, because their requests start immediately, whether or not the caller
subscribes. A listener canceling the matching event is recorded as `cancelled` with
reason `listener`, not as a failure; a mutation whose caller unsubscribes before it is
sent is `cancelled` with reason `abandoned`; operations interrupted by disposal are
`cancelled` with reason `disposed`. Superseded metadata and payload fetches record
`cancelled` with reason `superseded` and release every associated telemetry observer.
Bookmark names, ids,
payloads and error messages are never included.

Custom providers opt in through the optional `IBookmarkProvider.connectTelemetry`
method. Bookmark results, errors and event cancellation behave as before.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency.

Ref: #5805.
