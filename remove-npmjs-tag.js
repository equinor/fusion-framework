#!/usr/bin/env node
import { execSync } from 'node:child_process';
import chalk from 'chalk';

function getWorkspacePackages() {
  try {
    // Run PNPM recursive command to output directory and package.json for each package
    const output = execSync('pnpm -r exec cat package.json | jq -c "."', {
      encoding: 'utf-8',
    });
    const packages = output
      .split('\n')
      .filter((line) => line.trim() !== '') // Filter out empty lines
      .map((pkg) => {
        try {
          return JSON.parse(pkg);
        } catch (e) {
          console.warn('Skipping invalid JSON:', pkg);
          return null;
        }
      })
      .filter((pkg) => !pkg?.private);
    return packages;
  } catch (error) {
    console.error('Error listing workspace packages:', error.message);
    return [];
  }
}

function removeNpmjsTag(tag) {
  const packages = getWorkspacePackages().filter((p) => !p.private);
  for (const pkg of packages) {
    try {
      console.log(`Removing 'next' tag for ${pkg.name}@${pkg.version}...`);
      // Execute npm dist-tag rm command
      execSync(`npm dist-tag rm ${pkg.name} ${tag}`, { stdio: 'inherit' });
      console.log(
        `${chalk.greenBright('Success:')} removed '${tag}' tag for ${pkg.name}@${pkg.version}`,
      );
    } catch (error) {
      console.error(
        `${chalk.redBright('Failure:')} to remove '${tag}' tag for ${pkg.name}@${pkg.version}:`,
        error.message,
      );
    }
  }
}

const tag = process.argv[2];
if (!tag) {
  console.error('Error: Please provide a tag to remove (e.g., ./remove-tag.js next)');
  process.exit(1);
}

removeNpmjsTag(tag);
