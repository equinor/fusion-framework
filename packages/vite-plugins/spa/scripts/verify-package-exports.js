import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const targets = [pkg.types];

for (const exportConfig of Object.values(pkg.exports)) {
  if (typeof exportConfig === 'string') {
    targets.push(exportConfig);
    continue;
  }

  targets.push(...Object.values(exportConfig));
}

for (const target of targets) {
  if (!fs.existsSync(new URL(`../${target}`, import.meta.url))) {
    throw new Error(`Package export target is missing: ${target}`);
  }
}

console.log(
  `Verified package export targets: ${targets
    .map((target) => path.posix.normalize(target))
    .join(', ')}`,
);
