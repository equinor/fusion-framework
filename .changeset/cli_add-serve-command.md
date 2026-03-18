---
"@equinor/fusion-framework-cli": minor
---

Add `app serve` command to serve built applications with the dev-portal.

The new `serve` command provides a production-like preview environment for testing built applications locally. It serves your built application through the dev-portal, similar to the `dev` command but using production-built files.

```sh
pnpm fusion-framework-cli app serve
pnpm fusion-framework-cli app serve --port 5000
pnpm fusion-framework-cli app serve --dir ./dist --host 0.0.0.0
```

The command automatically detects the build directory from your Vite configuration and provides options for custom port, host, directory, manifest, and config files. The application must be built first using `ffc app build` before serving.

