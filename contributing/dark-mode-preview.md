# Preview dark mode with a local Verdaccio registry

Use this **only** for the dark-mode PR chain, not for releases. Run the Web Components preview producer first, then build React Components against that exact Web snapshot. In `$HOME/.config/fusion-dark-mode/`, keep the resulting `web-<web-short-sha>.json` and `react-<react-short-sha>-<web-short-sha>.json` next to a private (`0600`) `npmrc` authenticated only for `http://127.0.0.1:4873/`. Both the default registry and `@equinor` scope in that file must point to loopback. Keep the older `web.json`, `react.json` and their tags intact; they are not current-head inputs.

From the Framework PR checkout, with Node 24, the repository's pinned pnpm, the installed Changesets CLI, and `gh` authenticated for PR reads, run the checked-in helper. Pass the three full source SHAs in Framework, Web, React order. For the existing qualified handoff:

```sh
node .github/scripts/dark-mode-preview.mjs \
  238ff93ee22be32b82c17d1e86aa66cfd48b5f8e \
  090f40d9f068563ae5943ed911e31ab6849a8c8a \
  ec11c849421411f069ed73335271041128dd1ed5 --reuse
```

`--reuse` requires an existing framework manifest. It verifies source, upstream lineage, versions, tags and tarball SHA-512 digests without building, writing the manifest, or publishing. An upstream PR may advance from the supplied source SHA only if the complete comparison shows modifications limited to its root `CONTRIBUTING.md` and its own preview script (`scripts/dark-mode-preview.mjs` for Web or `scripts/dark-mode-preview.js` for React). It never substitutes a newer input manifest. Changes outside those paths, including package inputs and dependency or lock files, stop reuse.

To build and pack without publishing, omit `--reuse`. Append `--publish` instead to publish a new qualified set to loopback only. These modes require exact live upstream heads; they verify and reuse an existing exact-head manifest without rewriting it. A missing tarball or a version or tag collision stops the run. Never overwrite or retag published versions.

The producer checks the live upstream PR heads and accepts a Framework source ancestor only when the intervening changes are limited to this helper, its tests and this guide. It archives the selected commit, not working-tree edits or `node_modules`. The temporary workspace checks stable ranges separately from the exact prerelease pins. For this handoff it aligns the side-sheet and errorboundary ranges to `^3.0.0` only in staging. It leaves Web's `fusion-web-theme` at compatible 0.1.x and pins the React 0.2.0 snapshot only on compatible dependency edges. It uses Changesets release versions, builds and tests the source, and packs exact prerelease dependencies before checking the CLI's dependency graph. Nothing edits the real workspace, its lockfile, CI, or global registry settings.

The output is limited to the public AG Grid module and React bindings (38.0.0), bookmark (3.0.0), roles (0.3.0), and patch bumps of the SPA plugin and bundled dev portal. It does not publish cookbooks, standalone apps, private packages, the CLI, or the dev server. The latter two load the dev portal and SPA plugin by package name; a consumer's opt-in preview must override **transitive** resolutions as well as direct dependencies. In particular, overriding only the AG Grid packages won't exercise the dev shell.

The framework tag is `dark-mode-<framework-short-sha>-<react-short-sha>-<web-short-sha>`. After publication, the producer downloads the tarballs from loopback again and writes `framework-<framework-short-sha>-<react-short-sha>-<web-short-sha>.json` alongside the upstream manifests. Pass all three manifests to Portal and Core Apps, using the exact `version` and `integrity` values rather than `stableVersion`.

Local success does **not** make the PR ready to merge. The checked-in side-sheet and errorboundary ranges still exclude the planned 3.0.0 upstream versions. Choose the supported roles peer range and verify it before updating those manifests. The normal frozen install also needs upstream releases and a regenerated lockfile. Do not copy the temporary lockfile or credentials into the repository.
