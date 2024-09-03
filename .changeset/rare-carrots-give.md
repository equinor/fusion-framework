---
"@equinor/fusion-framework-cli": major
---

# App management

Adding new commands for app management, `publish`, `upload` and `tag`.

Introduces new parameters to the `config` command for publishing the app config to a build version.

## breaking changes

- This introduces braking changes to the `AppManifest` type. Apps-service is now returning instance of `ApplicationManifest` class.

- The app-config endpoints is now an object containing url and scopes, where name is the object key:

  ```ts
    environment: {
        scope: 'foobar',
    },
    endpoints: {
        api: {
            url: 'https://foo.bars'
            scopes: ['foobar']
        },
    },
  ```
