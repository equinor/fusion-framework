# Fusion Framework
🚨 **WIP**🏗

This framework is under construction and currently under beta.

__Expect breaking changes untill stable release!__

## 📚 read the [Doc](https://equinor.github.io/fusion-framework/)
## 🚀 see the [Road Map](https://equinor.github.io/fusion-framework/roadmap)
## 🍰 see our [Cookboks](https://github.com/equinor/fusion-framework/tree/main/cookbooks)
> read [setup](#setup) before starting a cookbook directly from this repo

## Repo structure

- 🗂️ Cookbooks - _collection of sample code_
- 🗂️ Packages - _@equinor/fusion-framework-{FOLDER}_
  - 📦 App - _base wire for applications_
  - 📦 CLI - _tooling for building application_
  - 📦 Framework - _root initiator (portal)_
  - 🗂️ Modules - _collection of modules_
  - 🗂️ React - _collection of tooling for React_
    - 📦 App - _tooling for apps_
    - 📦 Framework - _tooling for root initiator (portal)_
    - 🗂️ Modules - _collection of modules with tooling_
  - 🗂️ Utils - _collection of utilities_


# Setup
this is a mono repo, packages need to be installed and hoisted before developing.
```sh
  # install packages
  yarn
  # build all packages
  yarn build
```


