---
title: Fusion Framework CLI - App
---

Application utilities

## Commands

```sh
fusion-framework-cli app --help
```

### dev

develop an application (with [Vite](https://vitejs.dev/) and generic [Fusion](https://fusion.equinor.com/) portal)

```sh
fusion-framework-cli app dev --help
```

### build
builds application
> only source files are included, the dev-port is __not__ bundled.

```sh
fusion-framework-cli app build --help
```

### manifest
generates manifest
```sh
fusion-framework-cli app manifest --help
```

### config
generates application config
```sh
fusion-framework-cli app config --help
```

__example__
```sh
fusion-framework-cli app config -o my-app.config.json
fdev portal config -e ci -k my-app --config-file my-app.config.json set
```


### pack

bundle application, generate manifest and zip output

> [!NOTE]
> This function will be deprecated in the future, since new application service will supports `tar`

```sh
fusion-framework-cli app pack --help
```

__example__
```sh
fusion-framework-cli app pack
fdev portal upload -e ci -k my-app dist/app-bundle.zip
```