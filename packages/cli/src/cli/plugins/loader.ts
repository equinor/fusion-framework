import type { Command } from 'commander';
import { importConfig, FileNotFoundError } from '@equinor/fusion-imports';
import { readPackageUp } from 'read-package-up';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { findUp } from 'find-up';
import { readFileSync } from 'node:fs';
import type { FusionCliConfig, FusionCliConfigExport } from '../../lib/fusion-cli-config.js';

/**
 * Attempts to load and register plugins from configuration files
 * Searches for fusion-cli.config.ts files using find-up from current directory and CLI package directory
 * @param program - The Commander program instance to register commands with
 * @returns Promise that resolves when plugin loading is complete
 */
import type { FusionCliPlugin } from '../../lib/fusion-cli-config.js';

export async function loadPlugins(program: Command): Promise<void> {
  const allPlugins: FusionCliPlugin[] = [];

  // Helper function to load config from a file path
  const loadConfigFromFile = async (configPath: string): Promise<FusionCliPlugin[]> => {
    try {
      const configDir = dirname(configPath);
      const configResult = await importConfig<FusionCliConfig, { default: FusionCliConfigExport }>(
        ['fusion-cli.config'],
        {
          baseDir: configDir,
          script: {
            resolve: async (module) => {
              const configExport = module.default;
              // If the export is a function, invoke it with environment
              if (typeof configExport === 'function') {
                const result = await configExport({ root: configDir });
                return result ?? { plugins: [] };
              }
              // Otherwise, treat it as a config object
              return configExport ?? { plugins: [] };
            },
          },
        },
      );
      return configResult.config.plugins || [];
    } catch (error) {
      // Config not found - this is fine, return empty array
      if (!(error instanceof FileNotFoundError)) {
        console.warn(`Warning: Failed to load plugin configuration from ${configPath}:`, error);
      }
      return [];
    }
  };

  // Search for fusion-cli.config.ts files from multiple starting points
  const searchPaths = [
    process.cwd(), // Current working directory
    fileURLToPath(import.meta.url), // CLI package directory
  ];

  // Find all fusion-cli.config.ts files (supports .ts, .js, .json extensions)
  const configFiles = await Promise.all(
    searchPaths.map(async (startPath) => {
      const configFile = await findUp(
        ['fusion-cli.config.ts', 'fusion-cli.config.js', 'fusion-cli.config.json'],
        { cwd: dirname(startPath) },
      );
      return configFile;
    }),
  );

  // Load configs from found files (deduplicate by path)
  const uniqueConfigFiles: string[] = Array.from(
    new Set(configFiles.filter((f: string | undefined): f is string => f !== undefined && f !== null)),
  );
  for (const configFile of uniqueConfigFiles) {
    const plugins = await loadConfigFromFile(configFile);
    allPlugins.push(...plugins);
  }

  // If no plugins are configured, skip loading
  if (allPlugins.length === 0) {
    return;
  }

  // Use package root for resolution (or current directory if no package.json)
  const pkg = await readPackageUp({ cwd: process.cwd() });
  const packageRoot = pkg ? dirname(pkg.path) : process.cwd();

  // Find CLI package root for resolving plugins installed in CLI's devDependencies
  const cliPackagePath = fileURLToPath(import.meta.url);
  const cliPkg = await readPackageUp({ cwd: dirname(cliPackagePath) });
  const cliPackageRoot = cliPkg ? dirname(cliPkg.path) : dirname(cliPackagePath);

  // Load and register each plugin
  for (const plugin of allPlugins) {
    try {
      // If plugin is a function, call it directly
      if (typeof plugin === 'function') {
        plugin(program);
        continue;
      }

      // Otherwise, treat it as a package name and dynamically import it
      const pluginPackage = plugin;

      // Try multiple resolution strategies to support different installation methods
      // 1. Try import.meta.resolve (Node.js 20.6.0+, best for ESM packages with exports)
      // 2. Try direct import (works with pnpm workspace and global installs)
      // 3. Try resolving from CLI package's node_modules (for plugins in CLI devDependencies)
      // 4. Try resolving from package root's node_modules (workspace/local installs)
      let pluginModule: {
        registerAiPlugin?: (program: Command) => void;
        default?: ((program: Command) => void) | unknown;
      } | null = null;

      let resolved = false;

      // Strategy 1: Try import.meta.resolve (Node.js 20.6.0+, handles ESM exports properly)
      if (typeof import.meta.resolve === 'function') {
        try {
          const resolvedPath = import.meta.resolve(pluginPackage);
          pluginModule = await import(resolvedPath);
          resolved = true;
        } catch {
          // Continue to next strategy
        }
      }

      // Strategy 2: Try direct import (works with pnpm workspace and global installs)
      if (!resolved) {
        try {
          pluginModule = await import(pluginPackage);
          resolved = true;
        } catch {
          // Continue to next strategy
        }
      }

      // Strategy 3: Try resolving from CLI package's node_modules
      // Manually construct path since require.resolve doesn't handle ESM exports well
      if (!resolved) {
        try {
          const pluginDir = join(cliPackageRoot, 'node_modules', pluginPackage);
          const pluginPkgPath = join(pluginDir, 'package.json');
          const pluginPkg = JSON.parse(readFileSync(pluginPkgPath, 'utf-8'));
          // Use exports field if available, otherwise fall back to main
          const entryPoint = pluginPkg.exports?.['.']?.import || pluginPkg.main;
          const pluginPath = join(pluginDir, entryPoint);
          const pluginUrl = pathToFileURL(pluginPath).href;
          pluginModule = await import(pluginUrl);
          resolved = true;
        } catch {
          // Continue to next strategy
        }
      }

      // Strategy 4: Try resolving from package root's node_modules
      if (!resolved) {
        try {
          const pluginDir = join(packageRoot, 'node_modules', pluginPackage);
          const pluginPkgPath = join(pluginDir, 'package.json');
          const pluginPkg = JSON.parse(readFileSync(pluginPkgPath, 'utf-8'));
          // Use exports field if available, otherwise fall back to main
          const entryPoint = pluginPkg.exports?.['.']?.import || pluginPkg.main;
          const pluginPath = join(pluginDir, entryPoint);
          const pluginUrl = pathToFileURL(pluginPath).href;
          pluginModule = await import(pluginUrl);
          resolved = true;
        } catch {
          // All strategies failed
        }
      }

      if (!resolved || !pluginModule) {
        throw new Error(
          `Could not resolve plugin "${pluginPackage}" using any resolution strategy`,
        );
      }

      // Try to find the registration function
      // Support both named export (registerAiPlugin) and default export
      if (pluginModule.registerAiPlugin) {
        pluginModule.registerAiPlugin(program);
      } else if (pluginModule.default) {
        // Default export should be a function that takes the program
        if (typeof pluginModule.default === 'function') {
          pluginModule.default(program);
        }
      } else {
        console.warn(`Warning: Plugin "${pluginPackage}" does not export a registration function.`);
      }
    } catch (error) {
      // Plugin not installed or failed to load
      if (
        error instanceof Error &&
        (error.message.includes('Cannot find module') || error.message.includes('MODULE_NOT_FOUND'))
      ) {
        const pluginName = typeof plugin === 'string' ? plugin : 'function';
        console.warn(
          `Warning: Plugin "${pluginName}" is not installed. Install it to use its commands.`,
        );
      } else {
        // Log other errors for debugging
        const pluginName = typeof plugin === 'string' ? plugin : 'function';
        console.warn(`Warning: Failed to load plugin "${pluginName}":`, error);
      }
    }
  }
}
