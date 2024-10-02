---
"@equinor/fusion-framework-cli": major
---

Adding new commands for app management, `build-publish`,  `build-pack`, `build-upload`, `build-config`, `build-manifest` and `build-tag`.

Introduces new parameters to the `build-config` command for publishing the app config to a build version.

Commands:

- `build-pack` - Bundle the app for distribution
  - `-o, --output <output>` - Output directory for the packed app
  - `-a, --archive` - Archive name for the packed app
- `build-upload` - Upload the packed app to the Fusion App Store
  - `-b, --bundle <bundle>` - Path to the packed app bundle
  - `-e, --env <ci | fqa | tr | fprd>` - Environment to upload the app to
  - `-s, --service <service>` - Custom app service
- `build-tag` - Tag the uploaded app with a version
  - `-t, --tag <tag>` - Tag to apply to the uploaded app
  - `-v, --version <version>` - Version to attach to the tag
  - `-e, --env <ci | fqa | tr | fprd>` - Environment to tag the app in
  - `-s, --service <service>` - Custom app service
- `build-publish` - Publish the app config to a build version
  - `-t, --tag <tag>` - Tag to apply to the uploaded app
  - `-e, --env <ci | fqa | tr | fprd>` - Environment to tag the app in
  - `-s, --service <service>` - Custom app service
- `build-config` - Publish the app config to a build version
  - `-o, --output <output>` - Output file for the app config
  - `-c, --config <config>` - Path to the app config file (for config generation)
  - `-p, --publish<semver | current | latest | preview>` - Publish the app config to the build version
  - `-e, --env <ci | fqa | tr | fprd>` - Environment to publish the app config to
  - `-s, --service <service>` - Custom app service
- `build-manifest` - Creates the build manifest to publish with app
  - `-o, --output <output>` - Output file for manifest
  - `-c, --config <config>` - Manifest config file

simple usage:
```sh
fusion-framework-cli app build-publish -e ci
```

complex usage:
```sh
fusion-framework-cli app build-pack -o ./dist -a my-app.zip
fusion-framework-cli app build-upload -b ./dist/my-app.zip -e ci
fusion-framework-cli app build-tag -t my-tag -v 1.0.0 -e ci
```

After publishing a build of an app, the app config should be uploaded to the build version. This is done by running the `build-config` command.

```sh
# Publish the app config to the build version
fusion-framework-cli app build-config -p -e ci

# Publish the app config to a specific build tag
fusion-framework-cli app build-config -p preview -e ci

# Publish the app config to a specific build version
fusion-framework-cli app build-config -p 1.0.0 -e ci
```

__breaking changes:__

- renaming all commands accociated with build.
- The app-config endpoints is now an object containing url and scopes, where name is the object key:

  ```ts
    environment: {
        myProp: 'foobar',
    },
    endpoints: {
        api: {
            url: 'https://foo.bars'
            scopes: ['foobar./default']
        },
    },
  ```
- The `config` command has been removed, use `build-config` instead
