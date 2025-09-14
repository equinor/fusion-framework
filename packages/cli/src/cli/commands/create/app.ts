import { createCommand } from 'commander';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

import { assert } from '../../../lib/utils/assert.js';
import checkTargetDirectory from './_helpers/check-target-directory.js';
import selectTemplate from './_helpers/select-template.js';
import openInIDE from './_helpers/open-in-ide.js';
import installDependencies from './_helpers/install-dependencies.js';
import startDevServer from './_helpers/start-dev-server.js';
import setupRepository from './_helpers/setup-repository.js';
import cleanupTemplateFiles from './_helpers/cleanup-template-files.js';

/**
 * CLI command for creating new Fusion Framework applications from templates.
 * 
 * This command provides an interactive workflow for:
 * - Selecting from available project templates
 * - Setting up a local development environment
 * - Installing dependencies and starting development servers
 * 
 * @example
 * ```bash
 * # Create a new React app with interactive template selection
 * ffc create app my-new-app
 * 
 * # Create with a specific template
 * ffc create app my-app --template react-app
 * 
 * # Create in a specific directory with debug logging
 * ffc create app my-app --directory ./projects --debug
 * ```
 */
export const createAppCommand = (name: string) => createCommand(name)
  .description('Create a new Fusion application from template')
  .argument('<name>', 'Name of the application to create')
  .option(
    '-t, --template <type>',
    'Template type to use (will prompt if not specified or not found)',
  )
  .option('-d, --directory <path>', 'Directory to create the app in', '.')
  .option('--branch <branch>', 'Branch to checkout', 'main')
  .option('--clean', 'Clean the repo directory before cloning')
  .option('--debug', 'Enable debug mode for verbose logging')
  .action(
    async (
      name: string,
      options: {
        template?: string;
        directory: string;
        debug: boolean;
        branch: string;
        clean: boolean;
      },
    ) => {
      // Step 1: Validate input arguments and options
      assert(!!name, 'App name is required');
      assert(
        existsSync(options.directory),
        `Directory '${options.directory}' does not exist, use -d to specify a different directory`,
      );

      // Step 2: Initialize logging system with debug support
      const logger = new ConsoleLogger('', {
        debug: options.debug,
      });

      // Step 3: Resolve the target directory path for the new application
      const targetDir = resolve(options.directory, name);
      logger.debug(`Target dir: ${targetDir}`);

      // Step 4: Check if target directory exists and handle conflicts
      // This will prompt user if directory has content and --clean wasn't specified
      const shouldContinue = await checkTargetDirectory(targetDir, logger, options.clean);
      if (!shouldContinue) {
        return;
      }

      // Step 5: Set up and initialize the template repository
      // This clones or updates the fusion-app-template repository
      const templateRepoName = 'equinor/fusion-app-template';
      const repo = await setupRepository(templateRepoName, options.clean, options.branch, logger);

      // Step 6: Load available templates and handle template selection
      // User can pre-select with --template or choose interactively
      const templates = await repo.getAvailableTemplates();
      const selectedTemplate = await selectTemplate(templates, options.template, logger);

      // Step 7: Copy template files and directories to target location
      // This creates the project structure based on the selected template
      selectedTemplate.copyTo(targetDir);
      logger.succeed('Template resources copied successfully!');

      // Step 8: Clean up temporary template repository (optional)
      // Asks user if they want to remove the cloned template repo
      await cleanupTemplateFiles(repo, logger);

      // Step 9: Offer to open the project in the user's IDE
      // Detects common IDEs and opens the project automatically
      await openInIDE(targetDir, logger);

      // Step 10: Install project dependencies using detected package manager
      // Supports npm, pnpm, and yarn with automatic detection
      const { installed: dependenciesInstalled, packageManager } = await installDependencies(targetDir, logger);

      // Step 11: Start development server if dependencies were installed
      // Only prompts if package installation was successful
      if (dependenciesInstalled && packageManager) {
        const devServerStarted = await startDevServer(targetDir, packageManager, logger);
        if (devServerStarted) {
          logger.debug('Development server started successfully');
        }
      }
    },
  );

export default createAppCommand;
