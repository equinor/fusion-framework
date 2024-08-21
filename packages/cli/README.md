---
title: Fusion Framework CLI
---

Node CLI utility for working with Fusion Applications.

### [App](/docs/app.md)

see [Configuration](docs/app-configuration.md)

- tooling for [Vitest](https://vitest.dev/) - 🚀 coming soon 
- tooling for proxy configuration  - 🚀 coming soon 

### Widget

Tooling for developing widgets  - 🚀 coming soon

### Portal

Tooling for developing portals  - 🚀 coming

### Commands

#### `fusion-framework-cli`

The cli is named `fusion-framework-cli`. You can run it in the terminal or in your package scripts. 

The fusion-famework-cli should be installed as a devDependency.

```sh
pnpm add -D @equinor/fusion-framework-cli
```

You can always use the option `-h or --help or help` to get help for the CLI and its commands.

Example:

```sh
fusion-framework-cli help
```

---

#### `fusion-framework-cli app`

The `app` command give you the possibility to manage your app from the commandline. There are commands for running, building, packaging and publishing your application.

This should be run from your apps workspace root.

Commands:

- [dev](#fusion-framework-cli-app-dev) - Start development server for application
- [build](#fusion-framework-cli-app-build) - Builds application
- [config](#fusion-framework-cli-app-config) - Generate config
- [manifest](#fusion-framework-cli-app-manifest) - Generate manifest
- [pack](#fusion-framework-cli-app-pack) - Create  distributable app bundle of the application
- [publish](#fusion-framework-cli-app-publish) - Publish application to app api
- [upload](#fusion-framework-cli-app-upload) - Upload packaged app bundle to app api
- [tag](#fusion-framework-cli-app-tag) - Tag a published version
- help - display help for any command

Options:

```sh
  -h, --help          display help for command
```

Example:

```sh
fusion-framework-cli app
```

---

#### `fusion-framework-cli app dev`

The `dev` command starts a development server for current application

Options:

```sh
  -p, --port <number>        dev-server port
  -P, --portal <string>      fusion portal host
  -c, --config <file>        use specified application config, by default search for app.config.{ts,js,json}
      --manifest <file>      use specified manifest, by default search for app.manifest.config.{ts,js,json}
      --vite <file>          use specified Vite config file, by default search for app.vite.config.{ts,js,json}
  -F, --framework <string>   application framework to build the application on, supported: [react] (default: "react")
  -d, --dev-portal <string>  Location of dev-portal you want to use
  -h, --help                 display help for command
```

Example:

```sh
fusion-framework-cli app dev -p 3001
```

---

#### `fusion-framework-cli app build`

The `build` command, you guessed it, compiles the application with vite.

Options:

```sh
  -o, --outDir, <string>    output directory of package (default: "dist")
  -c, --config <string>     Use specified config file, see https://vitejs.dev/guide/cli.html#build
      --vite <string>       use specified Vite config file, by default search for app.config.vite.{ts,js,json}
  -F, --framework <string>  application framework to build the application on, supported: [react] (default: "react")
  -h, --help                display help for command
```

Example:

```sh
fusion-framework-cli app build -o dist
```

---

#### `fusion-framework-cli app config`

The `config` command generates config file for the application.

Options:

```sh
  -o, --output <string>              output file
  -c, --config <string>              application config file
  -p, --publish <string>             Publish app config to version [(semver | current)]
  -e, --env, <| ci | fqa | tr | fprd>  Fusion environment to build api urls from. used when publishing config.
  -s, --service, <string>            Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands. used when publishing config
  -h, --help                         display help for command
```

Example that published the config to app version "1.0.3" in the "ci" environment:

```sh
fusion-framework-cli app config -p 1.0.3 -e ci
```

---

#### `fusion-framework-cli app manifest`

The `manifest` command generates manifest file for the application.

Options:

```sh
  -o, --output <string>  output file
  -c, --config <string>  manifest config file
  -h, --help             display help for command
```

Example:

```sh
fusion-framework-cli app manifest -o manifest.json
```

---

#### `fusion-framework-cli app pack`

The `pack` command creates a distributable app bundle of the application.

Options:

```sh
  -o, --outDir, <string>   output directory of package (default: "dist")
  -a, --archive, <string>  output filename (default: "app-bundle.zip")
  -h, --help               display help for command
```

Example:

```sh
fusion-framework-cli app pack
```

---

#### `fusion-framework-cli app publish`

The `app publish` command is a convenience command to handle packing, publishing and tagging in one command.

It runs the following commands in order:

- `app pack` command that generates a zip file,
- `app upload` command that uploads the generated zip
- `app tag` command to tag the uploaded build.

Options:

```sh
  -t, --tag, <string>                Tagname to publish this build as [(latest | preview)] (default: "latest")
  -e, --env, <ci | fqa | tr | fprd>  Fusion environment to build api urls from
  -s, --service, <string>            Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands
  -h, --help                         display help for command
```

Example that publishes this build as preview in ci:

```sh
fusion-framework-cli app publish -t preview -e ci
```

---

#### `fusion-framework-cli app upload`

The `app upload` command takes a generated bundle file and uploads it to the appKey you are running the command from. the bundle must be a zip file, but support for tar.gz will come soon.

Options:

```sh
  -b, --bundle, <string>             The packaged app bundle file to upload (default: "app-bundle.zip")
  -e, --env, <ci | fqa | tr | fprd>  Fusion environment to build api urls from
  -s, --service, <string>            Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands
  -h, --help                         display help for command
```

Example that uploads zip package to ci:

```sh
fusion-framework-cli app upload -b app-bundle.zip -e ci
```

---

#### `fusion-framework-cli app tag`

The `app tag` commands tags the specified version with preview or latest, where latest is default. The `--version` parameter must be a previously published build.

Options:

```sh
  -t, --tag, <string>                Tag the published version with tagname [(latest | preview)] (default: "latest")
  -v, --version, <string>            Version number to tag, must be a published version number
  -e, --env, <ci | fqa | tr | fprd>  Fusion environment to build api urls from
  -s, --service, <string>            Define uri to custom app service. You can also define the env variable CUSTOM_APPAPI to be used on all publish commands
  -h, --help                         display help for command
```

Example that tags version 1.0.3 with preview in ci:

```sh
fusion-framework-cli app tag -v 1.0.3 -t preview -e ci
```

---

### Authentication

To run any app commands involving the [app api](https://fusion-s-apps-ci.azurewebsites.net/swagger/index.html), you need to provide a valid fusion access_token.

The CLI will look for the env varable `FUSION_TOKEN`.

You can get an access token by using the azure `az` command in your local dev environment.

```sh
az login --scope example-env-scope.default
az account get-access-token
```

See the [section](#authentication-in-github-actions) for using the framework-cli in a workflow with azure authentication.

---

### Authentication in GitHub actions

To run `fusion-framework-cli` commands towards the apps service, you need to set the env variable `FUSION_TOKEN` with a valid azure access_token in the the Equinor tenant.

To get azure access_token in a action you need to:

- Create azure service principal credentials to authenticate action and save them as secrets in your repository.
- use the action `azure/login@v2` with the secret credentials to authenticate.
- use the action `azure/cli@v2` to retreive access token for logged in user.
- Save access token as `FUSION_TOKEN` env variable.
- Run `fusion-framework-cli app XX` command like publish, upload or tag.

Create a GitHub Action **secret** AZURE_CREDENTIALS with the value as an object like described in the example below:

```json
{
    "clientSecret":  "******",
    "subscriptionId":  "******",
    "tenantId":  "******",
    "clientId":  "******"
}
```

Define workflow steps that runs the `az` command to get a token and save the token in env variable ``FUSION_TOKEN``.

```yaml
steps:
  - name: Azure login
    uses: azure/login@v2
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Azure CLI
    uses: azure/cli@v2
    with:
      azcliversion: latest
      inlineScript: |
        export FUSION_TOKEN="$(az account get-access-token --scope example-env-scope\.default)"
  
  - name: Publish app...
```

You can then use commands like ``fusion-framework-cli app publish``, or run defined package script `pnpm app:publish`, in you workflow to publish the application to the apps service.
