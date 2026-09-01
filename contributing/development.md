# Development

This document describes the process for running this application on your local computer.

## Getting started

It runs on macOS, Linux environments (should work on windows).

> none of the developers nor our workflows run windows, we encourage running [windows subsystem](https://learn.microsoft.com/en-us/windows/wsl/about).
>
> if your a windows user and has a MS inter-opt fix, we welcome PR`s 😇 

You'll need Node.js to run the site. Check the version in `package.json`. To install Node.js, [download the "LTS" installer from nodejs.org](https://nodejs.org). If you're using [`nodenv`](https://github.com/nodenv/nodenv), read the [`nodenv` docs](https://github.com/nodenv/nodenv#readme) for instructions on switching Node.js versions.

This repo uses the package manger [pnpm](https://pnpm.io), see [installation guide](https://pnpm.io/installation)

Once you've installed Node.js and pnpm, open Terminal and run the following:

```sh
  # clone repo
  git clone https://github.com/equinor/fusion-framework
  # install packages
  pnpm install
  # build all packages
  pnpm build
```


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

## READMEs:
- [agent-tooling](./agent-tooling.md)
- [code-standards](./code-standards.md)
- [self-review](./self-review.md)
- [cookbooks](./cookbooks.md)
- [changeset](./changeset.md)
- [git-workflow](./git-workflow.md)