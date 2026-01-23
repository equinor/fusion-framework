#!/usr/bin/env node
/*
 Align .changeset/pre.json initialVersions to current package versions.
 - No git needed. Uses pre.json tag rule only.
 - Update initialVersions to the current package.json version when the current
   version does NOT end with `-TAG.NUMBER` (e.g., `-next.0`).
 - Skip packages still suffixed with `-TAG.NUMBER`.

 Run from repo root:
   node .github/skills/rebase/scripts/align-pre-initial-versions.cjs
*/
const fs = require('fs');
const path = require('path');
// No git integration required

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function isIgnoredDir(name) {
  return (
    name === 'node_modules' ||
    name === '.git' ||
    name === 'dist' ||
    name === 'build' ||
    name === '.turbo'
  );
}

function findPackages(rootDir) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    // Fast skip common large roots
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (isIgnoredDir(entry.name)) continue;
        const full = path.join(dir, entry.name);
        const pkgPath = path.join(full, 'package.json');
        if (fs.existsSync(pkgPath)) {
          try {
            const pkg = readJson(pkgPath);
            if (pkg && typeof pkg.name === 'string' && typeof pkg.version === 'string') {
              results.push({ name: pkg.name, version: pkg.version, dir: full, pkgPath });
            }
          } catch {
            // ignore invalid package.json
          }
        }
        // Recurse (packages can be nested deeper)
        walk(full);
      }
    }
  }
  walk(rootDir);
  return results;
}

function main() {
  const repoRoot = process.cwd();
  const prePath = path.join(repoRoot, '.changeset', 'pre.json');
  if (!fs.existsSync(prePath)) {
    console.error('No .changeset/pre.json found. Nothing to do.');
    process.exit(1);
  }

  const pre = readJson(prePath);
  if (
    !pre ||
    pre.mode !== 'pre' ||
    !pre.initialVersions ||
    typeof pre.initialVersions !== 'object'
  ) {
    console.error('Invalid pre.json: expected { mode: "pre", initialVersions: { ... } }');
    process.exit(1);
  }

  const packages = findPackages(repoRoot);

  const initial = pre.initialVersions;
  const updates = [];
  let touched = 0;

  // Build a lookup for quick access
  const byName = new Map(packages.map((p) => [p.name, p]));

  const tag = typeof pre.tag === 'string' ? pre.tag : 'next';
  const suffixRe = new RegExp(`-${tag}\\.\\d+$`);

  for (const [name, oldVersion] of Object.entries(initial)) {
    const pkg = byName.get(name);
    if (!pkg) continue; // keep unknown entries as-is
    // Skip packages still in pre mode (e.g., 2.0.0-next.0)
    if (suffixRe.test(pkg.version)) continue;
    // Update baseline when current version differs
    if (pkg.version !== oldVersion) {
      initial[name] = pkg.version;
      updates.push({ name, from: oldVersion, to: pkg.version });
      touched++;
    }
  }

  if (touched > 0) {
    writeJson(prePath, pre);
  }

  // Summary
  console.log('Align pre.json initialVersions complete');
  console.log(`- Packages scanned: ${packages.length}`);
  console.log(`- initialVersions updated: ${touched}`);
  if (updates.length) {
    for (const u of updates) {
      console.log(`  • ${u.name}: ${u.from} -> ${u.to}`);
    }
  }
}

main();
