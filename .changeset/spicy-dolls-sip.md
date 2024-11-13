---
'@equinor/fusion-framework-module-bookmark': major
---

rewrite bookmark module

Needed rewrite of the bookmark module to better represent the api, and provide a more robust interface for working with bookmarks. Instead of fixing the current implementation, it was decided to rework the entire module to save time and confusion in the future.

The v1 implementation had strong coupling with the portal code and was not a good representation of the api. The new implementation is more robust and independent of source systems. The new implementation uses zod schemas to validate requests and responses.

The new implementation is not backwards compatible with the v1 implementation, so all ancestor modules should be updated to reflect the changes in this module.

The new implementation has better state management and error handling, and should be easier to work with than the v1 implementation.

**Highlights:**

-   has validation of configuration of the module.
-   uses the `BaseConfigBuilder` pattern for configuration.
-   has validation of requests and responses using zod schemas.
-   has better error handling and state management.
-   has better separation of concerns.
-   has better documentation.
-   has better state management.
-   has better flow control.
-   has better logging.

**Migration:**

- update config for enabling the module
- check all direct access to provider interface if they are still valid

**Breaking changes:**
- The provider interface has changed
- The client interface has changed
- The configuration interface has changed