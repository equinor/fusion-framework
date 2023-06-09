---
---

update generating version of application.
when bootstrapping this repo (`yarn`) the `install` script of root `package.json` will call all packages `postversion` script which generates the current package version.

As a developer, execute `yarn` after pulling the PR for generating local versions

The reason for bootstrap is since affected app will build ancestors, since the codebase is `composite`, which will fail if `src/version.ts` does not exist