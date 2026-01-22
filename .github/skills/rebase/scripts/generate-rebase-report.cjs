#!/usr/bin/env node
/*
 Generate a detailed rebase report with raw metrics and anomaly data.
 
 Compares local HEAD against origin/<branch> and collects:
 - Ahead/behind commit counts
 - File changes, insertions, deletions
 - Largest diffs, config changes, dependency bumps
 - Commit list, changed packages, pre.json updates
 
 Usage (from repo root):
   node .github/skills/rebase/scripts/generate-rebase-report.cjs [--no-fetch]

 Output:
   .tmp/skills/rebase/<timestamp>-rebase-report.md
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function run(cmd, args, opts = {}) {
  const res = cp.spawnSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  if (res.status !== 0) {
    const msg = `${cmd} ${args.join(' ')} failed: ${res.stderr || res.stdout}`.trim();
    throw new Error(msg);
  }
  return res.stdout.trim();
}

function safeRun(cmd, args, opts) {
  try {
    return run(cmd, args, opts);
  } catch {
    return '';
  }
}

function readJsonOrNull(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function detectRemoteBranch() {
  // Prefer upstream of HEAD
  const upstream = safeRun('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  if (upstream) return upstream;
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return `origin/${branch}`;
}

function listChangedFiles(remoteRef) {
  const out = safeRun('git', ['diff', '--name-only', `${remoteRef}..HEAD`]) || '';
  return out.split('\n').filter(Boolean);
}

function listNameStatus(remoteRef) {
  const out = safeRun('git', ['diff', '--name-status', `${remoteRef}..HEAD`]) || '';
  // Format: "M\tpath" or "A\tpath" or "D\tpath"
  return out.split('\n').filter(Boolean).map((line) => {
    const [status, ...rest] = line.split('\t');
    return { status, file: rest.join('\t') };
  });
}

function diffShortStat(remoteRef) {
  // Example: " 123 files changed, 4567 insertions(+), 890 deletions(-)"
  const stat = safeRun('git', ['diff', '--shortstat', `${remoteRef}..HEAD`]);
  return stat || 'No differences';
}

function aheadBehind(remoteRef) {
  // Count commits on HEAD that are not in remote
  const counts = safeRun('git', ['rev-list', '--count', `${remoteRef}..HEAD`]);
  if (!counts) return { behind: 0, ahead: 0 };
  return { behind: 0, ahead: Number(counts || 0) };
}

function commitList(remoteRef) {
  const log = safeRun('git', ['log', '--oneline', '--no-merges', `${remoteRef}..HEAD`]);
  return log || '';
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function numstat(remoteRef, filterPath) {
  const args = ['diff', '--numstat', `${remoteRef}..HEAD`];
  if (filterPath) args.push(filterPath);
  const out = safeRun('git', args) || '';
  const rows = out.split('\n').filter(Boolean).map((line) => {
    const [added, removed, file] = line.split('\t');
    return { added: Number(added || 0), removed: Number(removed || 0), file };
  });
  return rows;
}

function topLevelFolders(files) {
  const buckets = new Map();
  for (const f of files) {
    const top = f.split('/')[0] || f;
    buckets.set(top, (buckets.get(top) || 0) + 1);
  }
  return Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
}

function findChangedPackageDirs(files) {
  const dirs = new Set();
  for (const f of files) {
    if (f.startsWith('packages/') || f.startsWith('cookbooks/')) {
      const parts = f.split('/');
      // packages/<name>/... OR cookbooks/<name>/...
      if (parts.length >= 2) dirs.add(`${parts[0]}/${parts[1]}`);
    }
  }
  return Array.from(dirs).sort();
}

function loadPackageNames(dirs) {
  const results = [];
  for (const d of dirs) {
    const pkgPath = path.join(d, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = readJsonOrNull(pkgPath);
      if (pkg && pkg.name) results.push({ dir: d, name: pkg.name });
    }
  }
  return results;
}

function stripRangePrefix(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/^\^|^~|^>=|^<=|^>|^</, '');
}

function semverMajor(v) {
  if (!v) return null;
  const s = stripRangePrefix(v);
  const m = s.match(/(\d+)\./);
  return m ? Number(m[1]) : null;
}

function compareDeps(oldObj = {}, newObj = {}) {
  const all = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const added = [];
  const removed = [];
  const changed = [];
  for (const k of all) {
    const o = oldObj[k];
    const n = newObj[k];
    if (o == null && n != null) added.push({ name: k, to: n });
    else if (o != null && n == null) removed.push({ name: k, from: o });
    else if (o != null && n != null && o !== n) {
      const oM = semverMajor(o);
      const nM = semverMajor(n);
      const type = oM != null && nM != null ? (nM > oM ? 'major+' : nM < oM ? 'major-' : 'minor/patch') : 'range-change';
      changed.push({ name: k, from: o, to: n, type });
    }
  }
  // Sort changed: majors first
  changed.sort((a, b) => (a.type === 'major+' || a.type === 'major-') === (b.type === 'major+' || b.type === 'major-') ? a.name.localeCompare(b.name) : (a.type.startsWith('major') ? -1 : 1));
  return { added, removed, changed };
}

function analyzePackageJsonDiff(remoteRef, filePath) {
  const remoteRaw = safeRun('git', ['show', `${remoteRef}:${filePath}`]);
  const localRaw = safeRun('cat', [filePath]);
  if (!remoteRaw || !localRaw) return null;
  let oldPkg, newPkg;
  try { oldPkg = JSON.parse(remoteRaw); } catch { return null; }
  try { newPkg = JSON.parse(localRaw); } catch { return null; }
  const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  const bySection = {};
  for (const sec of sections) {
    bySection[sec] = compareDeps(oldPkg[sec] || {}, newPkg[sec] || {});
  }
  return { filePath, name: newPkg.name || filePath, bySection };
}

function preJsonChanges(remoteRef) {
  const localPath = path.join('.changeset', 'pre.json');
  if (!fs.existsSync(localPath)) return null;
  const local = readJsonOrNull(localPath);
  const remoteRaw = safeRun('git', ['show', `${remoteRef}:.changeset/pre.json`]);
  const remote = remoteRaw ? JSON.parse(remoteRaw) : null;
  if (!local || !remote || !local.initialVersions || !remote.initialVersions) return null;
  const changes = [];
  for (const [name, oldV] of Object.entries(remote.initialVersions)) {
    const newV = local.initialVersions[name];
    if (newV && newV !== oldV) changes.push({ name, from: oldV, to: newV });
  }
  return changes.length ? changes : [];
}

function lockfileShortstat(remoteRef) {
  const numstat = safeRun('git', ['diff', '--numstat', `${remoteRef}..HEAD`, 'pnpm-lock.yaml']);
  if (!numstat) return null;
  // Format: "added\tremoved\tfile"
  const line = numstat.split('\n').filter(Boolean)[0];
  if (!line) return null;
  const [added, removed] = line.split('\t');
  return { added: Number(added || 0), removed: Number(removed || 0) };
}

function ensureTmpDir() {
  const dir = path.join('.tmp', 'skills', 'rebase');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function main() {
  const repoRoot = process.cwd();
  const args = process.argv.slice(2);
  const noFetch = args.includes('--no-fetch');

  if (!noFetch) {
    safeRun('git', ['fetch', 'origin']);
  }

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const remoteRef = detectRemoteBranch();

  const { ahead, behind } = aheadBehind(remoteRef);
  const files = listChangedFiles(remoteRef);
  const nameStatus = listNameStatus(remoteRef);
  const shortStat = diffShortStat(remoteRef);
  const commits = commitList(remoteRef);
  const topFolders = topLevelFolders(files);
  const changedDirs = findChangedPackageDirs(files);
  const changedPkgs = loadPackageNames(changedDirs);
  const preChanges = preJsonChanges(remoteRef);
  const lockStat = lockfileShortstat(remoteRef);

  // Highlight: large diffs
  const rows = numstat(remoteRef);
  const largest = rows
    .map((r) => ({ ...r, total: (r.added || 0) + (r.removed || 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Highlight: config changes
  const configTargets = [
    'pnpm-workspace.yaml', 'turbo.json', 'biome.json', 'vitest.config.ts',
    'tsconfig.json', 'tsconfig.base.json', 'package.json', '.npmrc', '.gitignore', 'pnpm-lock.yaml'
  ];
  const configChanged = files.filter((f) => configTargets.includes(f));

  // Highlight: package.json dependency bumps
  const pkgJsonChanged = nameStatus.filter((n) => n.file.endsWith('package.json') && n.status !== 'D').map((n) => n.file);
  const pkgAnalyses = [];
  for (const pj of pkgJsonChanged) {
    const a = analyzePackageJsonDiff(remoteRef, pj);
    if (a) pkgAnalyses.push(a);
  }
  const depSummary = [];
  for (const a of pkgAnalyses) {
    let majors = 0, adds = 0, removes = 0;
    for (const sec of Object.values(a.bySection)) {
      majors += sec.changed.filter((c) => c.type.startsWith('major')).length;
      adds += sec.added.length;
      removes += sec.removed.length;
    }
    if (majors || adds || removes) depSummary.push({ file: a.filePath, name: a.name, majors, adds, removes, analysis: a });
  }
  depSummary.sort((a, b) => b.majors - a.majors || b.adds - a.adds || a.file.localeCompare(b.file));

  // Highlight: unusual top-level changes (outside common dirs)
  const allowedTop = new Set(['packages', 'cookbooks', '.changeset', 'vue-press', 'patches', '.github', 'contributing']);
  const unusual = uniq(files.map((f) => f.split('/')[0]).filter((t) => t && !allowedTop.has(t) && !configTargets.includes(t) && t !== 'pnpm-lock.yaml'));

  // Parse shortStat to extract filesChanged, insertions, deletions
  const shortStatMatch = shortStat.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
  const filesChanged = shortStatMatch ? Number(shortStatMatch[1]) : 0;
  const insertions = shortStatMatch ? Number(shortStatMatch[2] || 0) : 0;
  const deletions = shortStatMatch ? Number(shortStatMatch[3] || 0) : 0;

  const out = [];
  out.push(`# Rebase Sanity Report: ${branch}`);
  out.push('');
  out.push(`- Remote: ${remoteRef}`);
  out.push(`- Ahead by: ${ahead} commit(s), Behind: ${behind} commit(s)`);
  out.push(`- Diff summary: ${shortStat || 'No differences'}`);
  out.push('');

  out.push('## Highlights & Anomalies');
  out.push('');
  if (largest.length) {
    out.push('**Largest file diffs (top 10):**');
    for (const r of largest) out.push(`- ${r.file}: +${r.added} / -${r.removed} (total ${r.total})`);
  }
  if (configChanged.length) {
    out.push('');
    out.push('**Config changes detected:**');
    for (const f of configChanged) out.push(`- ${f}`);
  }
  if (depSummary.length) {
    out.push('');
    out.push('**Dependency changes summary:**');
    for (const d of depSummary) {
      out.push(`- ${d.name} (${d.file}): ${d.majors} major(s), +${d.adds}, -${d.removes}`);
    }
  }
  if (unusual.length) {
    out.push('');
    out.push('**Unusual top-level paths changed:**');
    for (const t of unusual) out.push(`- ${t}`);
  }
  out.push('');

  out.push('## Commits (left=remote, right=local)');
  out.push('');
  out.push('```');
  out.push(commits || 'No commit differences');
  out.push('```');
  out.push('');

  out.push('## Changed Top-level Folders');
  out.push('');
  if (topFolders.length) {
    for (const [folder, count] of topFolders) {
      out.push(`- ${folder}: ${count} file(s)`);
    }
  } else {
    out.push('- None');
  }
  out.push('');

  out.push('## Changed Packages');
  out.push('');
  if (changedPkgs.length) {
    for (const p of changedPkgs) out.push(`- ${p.name} (${p.dir})`);
  } else {
    out.push('- None');
  }
  out.push('');

  out.push('## pre.json initialVersions changes');
  out.push('');
  if (preChanges && preChanges.length) {
    for (const c of preChanges) out.push(`- ${c.name}: ${c.from} -> ${c.to}`);
  } else {
    out.push('- None');
  }
  out.push('');

  out.push('## pnpm-lock.yaml changes');
  out.push('');
  if (lockStat) {
    out.push(`- Lines added: ${lockStat.added}, removed: ${lockStat.removed}`);
  } else {
    out.push('- None or not changed');
  }
  out.push('');

  out.push('## Detailed Dependency Changes');
  out.push('');
  if (depSummary.length) {
    for (const d of depSummary) {
      out.push(`### ${d.name} (${d.file})`);
      out.push('');
      const a = d.analysis;
      for (const [secName, secData] of Object.entries(a.bySection)) {
        if (secData.changed.length || secData.added.length || secData.removed.length) {
          out.push(`**${secName}:**`);
          if (secData.changed.length) {
            for (const c of secData.changed) {
              const indicator = c.type.startsWith('major') ? '⚠️ ' : '';
              out.push(`- ${indicator}${c.name}: ${c.from} → ${c.to} (${c.type})`);
            }
          }
          if (secData.added.length) {
            for (const add of secData.added) {
              out.push(`- ➕ ${add.name}: ${add.to}`);
            }
          }
          if (secData.removed.length) {
            for (const rem of secData.removed) {
              out.push(`- ➖ ${rem.name}: ${rem.from}`);
            }
          }
          out.push('');
        }
      }
    }
  } else {
    out.push('No dependency changes detected.');
    out.push('');
  }

  const tmpDir = ensureTmpDir();
  const timestamp = nowStamp();
  const reportPath = path.join(tmpDir, `${timestamp}-rebase-report.md`);
  fs.writeFileSync(reportPath, out.join('\n'), 'utf8');
  console.log(`Report written to: ${reportPath}`);
}

main();
