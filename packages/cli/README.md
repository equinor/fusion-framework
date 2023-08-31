# Fusion Framework CLI

[![npm version](https://badge.fury.io/js/@equinor%2Ffusion-framework-cli.svg)](https://badge.fury.io/js/@equinor%2Ffusion-framework-cli)

## install
install from your favorite package manger

## App
commands relative to working with applications

**app.config**

the cli will look for a `app.config.{ts,js,json}` which will be provided to the configuration step of the application

```ts
export type AppConfig = {
    /** application config */
    environment?: Record<string, unknown>;
};
```

**app.manifest**

the cli will look for a `app.manifest.{ts,js,json}` which will be provided to the configuration step oas manifest


**app.vite**

the cli will look for a `app.vite.{ts,js,json}` [Vite Configuration](https://vitejs.dev/config/)


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
generate manifest
```sh
fusion-framework-cli app manifest --help
```
### config
generate application config
```sh
fusion-framework-cli app manifest --help
```

__example__
```sh
fusion-framework-cli app config -o my-app.config.json
fdev portal config -e ci -k my-app --config-file my-app.config.json set
```


### pack

bundle application, generate manifest and zip output

```sh
fusion-framework-cli app pack --help
```

__example__
```sh
fusion-framework-cli app pack
fdev portal upload -e ci -k my-app dist/app-bundle.zip
```