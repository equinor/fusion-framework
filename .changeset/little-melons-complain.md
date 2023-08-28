---
'@equinor/fusion-framework-cli': minor
---

add command for generating manifest

generate manifest for application

```sh
fusion-framework-cli app manifest
#output to file
fusion-framework-cli app manifest -o manifest.json
#specify custom config
fusion-framework-cli app manifest -c app.manifest.custom.ts
```