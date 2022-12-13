---
title: App
category: Module
tag: 
  - application
  - manifest
  - application config
  - application loading
  - application module instance
---

This module purpose is:
- [x] load application manifest.
- [x] load application configuration.
- [x] load application javascript bundle.
- [x] keep track of current selected application

> This module is mainly developed for helping portal for keeping track of selected application and loading of application.

## Application instance

```mermaid
  sequenceDiagram
  participant L as App Loader
  participant P as App Provider
  participant A as App Container
  participant S as App Service
  participant M as App
  L->>+P: setCurrentApp(appKey)
  P->>+A: createApp(appKey)
  A->>-P: Application instance

  Note over L,A: onCurrentAppChange
  L->>+A: initialize()
  par
  A-->>+P: getManifest(appKey)
  P->>+S: fetch manifest
  S-->>-P: manifest
  P->>-A: set current manifest
  and
    A-->>+P: getConfig(appKey)
    A-->>+P: getConfig(appKey)
    P->>+S: fetch config
    S-->>-P: config
    P->>-A: set current config
  end
  Note over A: loads javascript as soon as first manifest loaded
  A-->>+P: getAppModule(manifest.entry)
  P->>+S: import(entrypoint)
  S-->>-P: javascript module
  P->>-A: set current javascript module

  Note over A: Emits as soon as manifest, config and script loaded
  A-->>-L: Application ready

  L->>+M: jsm.render(el, manifest, config)
  M-->M: initialize modules
  M-->+A: emit(onAppModulesLoaded)
  A->-A: setAppModuleInstance(modules)
  M-->-L: done
```

### Manifest

Meta data description of application, loaded from the Fusion Application Store

### Config

Configuration for the application 

### Script Modules

imported javascript script modules

### Instance

Collection of initialized modules of the application