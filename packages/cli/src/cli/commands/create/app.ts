import { createCommand } from 'commander';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { GitClientProtocol } from '../../../bin/helpers/ProjectTemplateRepository.js';

import { assert } from '../../../lib/utils/assert.js';
import { updatePackageJson } from './_helpers/update-package-json.js';
import checkTargetDirectory from './_helpers/check-target-directory.js';
import selectTemplate from './_helpers/select-template.js';
import openInIDE from './_helpers/open-in-ide.js';
import installDependencies from './_helpers/install-dependencies.js';
import setupRepository from './_helpers/setup-repository.js';
import cleanupTemplateFiles from './_helpers/cleanup-template-files.js';

/**
 * Configuration options for the create app command
 */
interface CreateAppOptions {
  /** Template type to use (will prompt if not specified or not found) */
  template?: string;
  /** Directory to create the app in (defaults to current directory) */
  directory: string;
  /** Enable debug mode for verbose logging and error details */
  debug: boolean;
  /** Git branch to checkout from the template repository */
  branch: string;
  /** Clean the repo directory before cloning (removes existing content) */
  clean: boolean;
  /** Git protocol to use for cloning (https or ssh) - skips prompt if provided */
  gitProtocol?: GitClientProtocol;
  /** Clean up temporary template files after creation - skips prompt if provided */
  cleanup?: boolean;
  /** Skip opening the project in IDE */
  noOpen?: boolean;
}

/**
 * Creates a new Fusion application from template with complete setup workflow.
 *
 * This function orchestrates the entire application creation process including:
 * - Input validation and directory conflict resolution
 * - Template repository setup and template selection
 * - File copying and package.json configuration
 * - Workspace dependency resolution to npm versions
 * - Development environment setup and server startup
 *
 * @param name - Name of the application to create (used for package.json name)
 * @param options - Command options including template, directory, debug, etc.
 * @param logger - Logger instance for output, progress feedback, and debugging
 * @throws {Error} If validation fails, template setup fails, or critical operations fail
 */
async function createApplication(
  name: string,
  options: CreateAppOptions,
  logger: ConsoleLogger,
): Promise<void> {
  // Step 1: Validate input arguments and options
  assert(!!name, 'App name is required');
  assert(
    existsSync(options.directory),
    `Directory '${options.directory}' does not exist, use -d to specify a different directory`,
  );

  // Step 2: Resolve the target directory path for the new application
  const targetDir = resolve(options.directory, name);
  logger.debug(`Target dir: ${targetDir}`);

  // Step 3: Check if target directory exists and handle conflicts
  // This will prompt user if directory has content and --clean wasn't specified
  const shouldContinue = await checkTargetDirectory(
    targetDir,
    logger,
    options.clean,
    options.directory,
  );
  if (!shouldContinue) {
    // Clean exit when user aborts the operation
    process.exit(0);
  }

  // Step 4: Set up and initialize the template repository
  // This clones or updates the fusion-app-template repository
  const templateRepoName = 'equinor/fusion-app-template';
  const repo = await setupRepository(
    templateRepoName,
    options.clean,
    options.branch,
    logger,
    options.gitProtocol,
  );

  // Step 5: Load available templates and handle template selection
  // User can pre-select with --template or choose interactively
  const templates = await repo.getAvailableTemplates();
  const selectedTemplate = await selectTemplate(templates, options.template, logger);

  // Step 6: Copy template files and directories to target location
  // This creates the project structure based on the selected template
  try {
    await selectedTemplate.copyTo(targetDir);
    logger.succeed('Template resources copied successfully!');
  } catch (error) {
    logger.error(
      `Failed to copy template resources: ${error instanceof Error ? error.message : String(error)}`,
    );
    logger.info('Please check the target directory permissions and try again');
    // Exit with error code 1 to indicate failure
    process.exit(1);
  }

  // Step 7: Update package.json with the provided app name and resolve workspace dependencies
  // This ensures the package name matches the application name and workspace deps are resolved to npm versions
  try {
    await updatePackageJson(
      targetDir,
      {
        updates: { name },
        resolveWorkspaceDependencies: true,
      },
      logger,
    );
    logger.succeed(`Updated package.json with app name: ${name}`);
  } catch (error) {
    logger.error(
      `Failed to update package.json: ${error instanceof Error ? error.message : String(error)}`,
    );
    logger.info('Please check the package.json file and try again');
    // Exit with error code 1 to indicate failure
    process.exit(1);
  }

  // Step 8: Clean up temporary template repository (optional)
  // Asks user if they want to remove the cloned template repo (unless --cleanup or --no-cleanup is provided)
  await cleanupTemplateFiles(repo, logger, options.cleanup);

  // Step 9: Offer to open the project in the user's IDE
  // Detects common IDEs and opens the project automatically (skipped if --no-open is provided)
  if (!options.noOpen) {
    await openInIDE(targetDir, logger);
  }

  // Step 10: Install project dependencies using detected package manager
  // Supports npm, pnpm, and yarn with automatic detection
  await installDependencies(targetDir, logger);
}

/**
 * CLI command for creating new Fusion Framework applications from templates.
 *
 * This command provides a comprehensive interactive workflow for:
 * - Validating input and resolving directory conflicts
 * - Selecting from available project templates (React, vanilla, etc.)
 * - Setting up complete local development environment
 * - Resolving workspace dependencies to npm versions
 * - Installing dependencies
 * - Opening projects in the user's preferred IDE
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
 *
 * # Create with clean directory and specific branch
 * ffc create app my-app --clean --branch develop
 *
 * # Non-interactive mode with all options specified
 * ffc create app my-app --template basic --git-protocol https --no-cleanup --no-open
 * ```
 */
export const createAppCommand = (name: string) =>
  createCommand(name)
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
    .option(
      '--git-protocol <protocol>',
      'Git protocol to use for cloning (https or ssh) - skips prompt if provided',
    )
    .option(
      '--cleanup',
      'Clean up temporary template files after creation - skips prompt if provided',
    )
    .option('--no-cleanup', 'Do not clean up temporary template files - skips prompt if provided')
    .option('--no-open', 'Skip opening the project in IDE')
    .action(async (name: string, options: CreateAppOptions) => {
      // Initialize logging system with debug support
      const logger = new ConsoleLogger('', {
        debug: options.debug,
      });

      // Validate git-protocol option if provided
      if (options.gitProtocol && options.gitProtocol !== 'https' && options.gitProtocol !== 'ssh') {
        logger.error(`Invalid git-protocol: ${options.gitProtocol}. Must be 'https' or 'ssh'`);
        process.exit(1);
      }

      try {
        // Execute the main application creation workflow
        await createApplication(name, options, logger);
      } catch (error) {
        // Handle any unexpected errors with clean exit and detailed logging
        logger.error(
          '❌ An unexpected error occurred:',
          error instanceof Error ? error.message : String(error),
        );
        if (options.debug) {
          // Include stack trace in debug mode for troubleshooting
          logger.error(
            'Stack trace:',
            error instanceof Error ? error.stack : 'No stack trace available',
          );
        }
        // Exit with error code 1 to indicate failure
        process.exit(1);
      }
    });

export default createAppCommand;
