---
'@equinor/fusion-framework-cli': patch
---

fixed loading of config files for Windows

found internal [issues](https://github.com/radarsu/ts-import/issues/39) with `ts-import` where file url path crashed native `fs` command, but failed on imports since windows can`t handle absolute paths.

quick and dirty transpile code and eject of `ts-import`


