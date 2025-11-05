#!/usr/bin/env node
import { execSync } from 'node:child_process';
import chalk from 'chalk';

/**
 * Get all workspace packages that are not private
 */
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
          console.warn('Skipping invalid JSON:', pkg, e);
          return null;
        }
      })
      .filter((pkg) => pkg && !pkg.private && pkg.name);
    return packages;
  } catch (error) {
    console.error('Error listing workspace packages:', error.message);
    return [];
  }
}

/**
 * Get all versions and their tags from npm for a package
 */
function getNpmPackageInfo(packageName) {
  try {
    const output = execSync(`npm view ${packageName} versions --json`, {
      encoding: 'utf-8',
    });
    const versions = JSON.parse(output);
    
    // Get dist-tags
    const distTagsOutput = execSync(`npm view ${packageName} dist-tags --json`, {
      encoding: 'utf-8',
    });
    const distTags = JSON.parse(distTagsOutput);
    
    return { versions, distTags };
  } catch (error) {
    // Package might not exist on npm
    return null;
  }
}

/**
 * Check if a version is a "next" version (contains -next)
 */
function isNextVersion(version) {
  return version.includes('-next');
}

/**
 * Find the highest semver version (excluding next versions)
 * npm returns versions in sorted order, so we can iterate backwards
 */
function findHighestStableVersion(versions) {
  // npm returns versions in sorted order, so iterate backwards to find highest stable
  for (let i = versions.length - 1; i >= 0; i--) {
    const version = versions[i];
    if (!isNextVersion(version)) {
      return version;
    }
  }
  
  return null;
}

/**
 * Fix npm tags for a package
 */
function fixPackageTags(packageName) {
  console.log(`\n${chalk.blue('Checking:')} ${packageName}`);
  
  const packageInfo = getNpmPackageInfo(packageName);
  if (!packageInfo) {
    console.log(`${chalk.yellow('  Skip:')} Package not found on npm`);
    return;
  }
  
  const { versions, distTags } = packageInfo;
  
  // Check if latest tag points to a next version
  const latestVersion = distTags.latest;
  const needsFix = latestVersion && isNextVersion(latestVersion);
  
  if (!needsFix) {
    console.log(`${chalk.green('  OK:')} Latest tag points to ${latestVersion} (not a next version)`);
    return;
  }
  
  console.log(`${chalk.red('  ISSUE:')} Latest tag points to ${latestVersion} (a next version!)`);
  
  // Find the highest stable version
  const highestStable = findHighestStableVersion(versions);
  
  if (!highestStable) {
    console.log(`${chalk.yellow('  Warning:')} No stable version found to tag as latest`);
    return;
  }
  
  console.log(`${chalk.cyan('  Fix:')} Tagging ${highestStable} as latest`);
  
  try {
    execSync(`npm dist-tag add ${packageName}@${highestStable} latest`, {
      stdio: 'inherit',
    });
    console.log(`${chalk.green('  Success:')} Tagged ${highestStable} as latest`);
  } catch (error) {
    console.error(`${chalk.red('  Error:')} Failed to tag ${highestStable} as latest:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${chalk.bold('🔍 Checking npm tags for all packages...\n')}`);
  
  const packages = getWorkspacePackages();
  console.log(`Found ${packages.length} packages to check\n`);
  
  const issues = [];
  
  for (const pkg of packages) {
    const packageName = pkg.name;
    const packageInfo = getNpmPackageInfo(packageName);
    
    if (!packageInfo) {
      continue;
    }
    
    const { distTags } = packageInfo;
    const latestVersion = distTags.latest;
    
    if (latestVersion && isNextVersion(latestVersion)) {
      issues.push({ packageName, latestVersion });
    }
  }
  
  if (issues.length === 0) {
    console.log(`${chalk.green('✅ No issues found!')} All packages have correct latest tags.\n`);
    return;
  }
  
  console.log(`${chalk.red(`⚠️  Found ${issues.length} package(s) with issues:\n`)}`);
  issues.forEach((issue) => {
    console.log(`  - ${issue.packageName}: latest → ${issue.latestVersion}`);
  });
  
  console.log(`\n${chalk.bold('🔧 Fixing tags...\n')}`);
  
  for (const pkg of packages) {
    fixPackageTags(pkg.name);
  }
  
  console.log(`\n${chalk.green('✅ Done!')}\n`);
}

main();

