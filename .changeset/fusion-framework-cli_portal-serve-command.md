---
"@equinor/fusion-framework-cli": minor
---

Add `portal serve` command for serving built portal templates in a production-like preview environment.

The new command starts a dev server that serves pre-built portal files, automatically detecting the build output directory from Vite configuration.

```sh
ffc portal serve
ffc portal serve --port 5000 --host 0.0.0.0
ffc portal serve --dir ./dist
```

Options include `--port`, `--host`, `--dir`, `--manifest`, `--config`, and `--debug`.
