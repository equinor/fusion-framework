---
'@equinor/fusion-observable': patch
---

Updated `@testing-library/react` dev dependency from `^14.2.0` to `^15.0.0`.

This is a patch bump because it only updates a dev dependency, which does not affect the public API or functionality of the `@equinor/fusion-framework-observable` package. Consumers of this package do not need to make any changes.

The `@testing-library/react` library is used internally for unit testing React components. Updating to the latest version ensures we have the latest testing utilities and improvements.

Highlights from the `@testing-library/react` v15.0.0 changelog:

-   Minimum supported Node.js version is 18.0
-   New version of `@testing-library/dom` changes various roles. Check out the [changed types](https://github.com/testing-library/dom-testing-library/releases/tag/v10.0.0) if you are using `ByRole` queries.
