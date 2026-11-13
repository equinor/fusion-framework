---
"@equinor/fusion-framework-cli": minor
---

Add Octopus support, so a local portal can load apps from their local dev servers:

- `ffc app dev --octopus [url]` registers the app with Octopus (default `http://localhost:2000`). Without `--port`, the dev server then takes a free port instead of 3000, which the portal uses.
- `ffc portal dev --octopus [url]` loads apps registered with Octopus from their dev server, every other app from CI as before, and starts Octopus when it is not running.
- `ffc octopus` starts Octopus on its own; `ffc octopus list` and `ffc octopus unregister <appKey>` inspect and change what is registered.

`app dev --port` no longer has a built-in default of `3000` in its option definition; the dev server still uses 3000 when neither `--port` nor `--octopus` is given.
