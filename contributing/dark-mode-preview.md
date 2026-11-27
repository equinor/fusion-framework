# Preview dark mode with a local Verdaccio registry

Use this **only** for the dark-mode PR chain, not for releases. Run the web-components and react-components preview producers first. They supply `web.json` and `react.json` in `$HOME/.config/fusion-dark-mode/`, next to a private (`0600`) `npmrc` authenticated for `http://127.0.0.1:4873/`. Both the default registry and `@equinor` scope in that file must point to the loopback registry.

From the framework PR checkout, with Node 24 and the repository's pinned pnpm:

```sh
# Verify inputs, install, build and pack without publishing (optional).
node .github/scripts/dark-mode-preview.mjs

# Do the same, then publish to local Verdaccio under dark-mode only.
node .github/scripts/dark-mode-preview.mjs --publish
```

The producer archives the current Git commit, not uncommitted changes or `node_modules`. In a temporary workspace it verifies the upstream tarballs against the producer manifests, pins them for this install, sets the versions with `pnpm version`, builds, and uses `pnpm pack` to materialize workspace dependencies as registry versions. Nothing edits the real workspace, its lockfile, CI, or global registry settings.

The output is limited to the public AG Grid module and React bindings (38.0.0), bookmark (3.0.0), roles (0.3.0), and patch bumps of the SPA plugin and bundled dev portal. It does not publish cookbooks, standalone apps, private packages, the CLI, or the dev server. The latter two load the dev portal and SPA plugin by package name; a consumer's opt-in preview must override **transitive** resolutions as well as direct dependencies. In particular, overriding only the AG Grid packages won't exercise the dev shell.

After publication, the producer downloads the tarballs from loopback again and atomically writes `$HOME/.config/fusion-dark-mode/framework.json` with the source commit, exact versions and SHA-512 integrities. Pass that manifest, along with `web.json` and `react.json`, to the portal and core-apps preview steps. A missing input, changed digest, or existing version with different bytes stops the run. Do not overwrite or retag an immutable version; coordinate a fresh isolated registry or compatible versions across the producers and consumers.

Local success does **not** make the PR ready to merge: the normal frozen install still needs real upstream releases and a normal lockfile update. Do not copy the temporary lockfile or credentials back into the repository.
