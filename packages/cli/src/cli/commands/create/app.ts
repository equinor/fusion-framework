import { createCommand } from 'commander';
import chalk from 'chalk';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  copyFileSync,
  rmSync,
  cpSync,
  renameSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import inquirer from 'inquirer';

import { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

import { checkoutRepo } from '../../../bin/helpers/checkout-repo.js';
import { assert } from '../../../lib/utils/assert.js';

const KNOWN_TEMPLATES = {
  bare: ' Minimal template with basic setup',
  basic: ' Complete template with common features',
} as const;

/**
 * Interactively select a template from available options using a beautiful interface
 */
async function selectTemplate(
  templates: string[],
  descriptions: Record<string, string>,
): Promise<string> {
  if (templates.length === 0) {
    throw new Error('No templates available');
  }

  if (templates.length === 1) {
    console.log(chalk.blue(`Using template: ${templates[0]}`));
    return templates[0];
  }

  // Create template descriptions and choices
  const templateChoices = templates.map((template) => {
    const description = descriptions[template as keyof typeof descriptions] || '';
    return {
      name: description ? `${template} - ${description}` : template,
      value: template,
      short: template,
    };
  });

  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: chalk.yellow('🎨 Select a template:'),
      choices: templateChoices,
      pageSize: 10,
      loop: false,
    },
  ]);

  return selectedTemplate;
}

/**
 * Prompt user to confirm installation of dependencies
 */
async function promptForDependencyInstallation(): Promise<boolean> {
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: chalk.yellow('📦 Install dependencies?'),
      default: true,
    },
  ]);

  return installDeps;
}

/**
 * Prompt user to confirm removal of temporary files
 */
async function promptForTempFileCleanup(): Promise<boolean> {
  const { removeTempFiles } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'removeTempFiles',
      message: chalk.yellow('🗑️  Remove temporary template files?'),
      default: false,
    },
  ]);

  return removeTempFiles;
}

/**
 * Determines which template to use based on user input and available templates.
 *
 * @param options - Command options containing the specified template
 * @param repoTemplates - List of available templates from the repository
 * @returns The selected template name
 */
async function determineTemplate(
  options: { template: string },
  repoTemplates: string[],
): Promise<string> {
  // If template is specified and exists, use it; otherwise let user choose
  if (options.template && repoTemplates.includes(options.template)) {
    return options.template;
  }

  if (options.template && !repoTemplates.includes(options.template)) {
    console.log(chalk.yellow(`Template '${options.template}' not found. Available templates:`));
    for (const template of repoTemplates) {
      console.log(chalk.gray(`  - ${template}`));
    }
  }
  return await selectTemplate(repoTemplates, KNOWN_TEMPLATES);
}

/**
 * Get available template types from the provided template directory.
 *
 * @param templateDir - Path to the template directory.
 * @returns Object containing the list of available templates and the templates directory path.
 * @throws If no template directories are found in the directory.
 */
function getAvailableTemplates(templateDir: string): string[] {
  // Use the provided template directory directly
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const templates = readdirSync(templateDir).filter((item) => {
    const itemPath = join(templateDir, item);
    return statSync(itemPath).isDirectory();
  });

  if (templates.length === 0) {
    throw new Error(`No template directories found in: ${templateDir}`);
  }

  return templates;
}

/**
 * Copy a directory and its contents to a target directory using native Node.js cpSync.
 *
 * @param src - Source directory path.
 * @param dest - Destination directory path.
 */
function copyDirectory(src: string, dest: string): void {
  cpSync(src, dest, { recursive: true });
}

/**
 * Run pnpm install in the target directory.
 *
 * @param targetDir - Directory to run pnpm install in.
 * @param logger - Logger instance for output.
 */
async function installDependencies(targetDir: string, logger: ConsoleLogger): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.start('Installing dependencies...');
    
    const child = spawn('pnpm', ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        logger.succeed('Dependencies installed successfully!');
        resolve();
      } else {
        logger.error(`pnpm install failed with exit code ${code}`);
        reject(new Error(`pnpm install failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      logger.error(`Failed to run pnpm install: ${error.message}`);
      reject(error);
    });
  });
}

/**
 * Clean up a temporary template directory.
 *
 * @param tempDir - Path to the temporary directory to clean up.
 */
function cleanupTemplateDir(tempDir: string): void {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

export const command = createCommand('app')
  .description('Create a new Fusion application from template')
  .argument('<name>', 'Name of the application to create')
  .option(
    '-t, --template <type>',
    'Template type to use (will prompt if not specified or not found)',
  )
  .option('-d, --directory <path>', 'Directory to create the app in', '.')
  .option('--debug', 'Enable debug mode for verbose logging')
  .action(
    async (name: string, options: { template: string; directory: string; debug: boolean }) => {
      // Validate arguments and options
      assert(!!name, 'App name is required');
      assert(
        existsSync(options.directory),
        `Directory '${options.directory}' does not exist, use -d to specify a different directory`,
      );

      // Create logger instance
      const logger = new ConsoleLogger('fusion create', {
        debug: options.debug,
      });

      // Resolve target directory
      const targetDir = resolve(options.directory, name);

      try {
        // Check out template repository locally
        const templateRoot = await checkoutRepo({
          repo: 'equinor/fusion-app-template',
          log: logger,
        });

        logger.debug(`Template root: ${templateRoot}`);

        // Get available templates from the repository
        const templatesDir = join(templateRoot, 'apps'); // Templates are in the apps subdirectory
        const availableTemplates = getAvailableTemplates(templatesDir);

        // Determine which template to use
        const templateType = await determineTemplate(options, availableTemplates);
        const template = {
          templateRoot,
          templateType,
          templatesDir,
          templateDir: join(templatesDir, templateType),
          resources: [
            { path: join(templateRoot, 'README.md') },
            { path: join(templateRoot, 'SECURITY.md') },
            {
              path: join(templateRoot, 'doc'),
              target: join(targetDir, 'doc'),
              recursive: true,
            },
            {
              path: join(templateRoot, '.github'),
              target: join(targetDir, '.github'),
              recursive: true,
            },
            {
              path: join(templateRoot, '.changeset'),
              target: join(targetDir, '.changeset'),
              recursive: true,
            },
          ],
        };
        logger.debug('Template:', template);

        // Copy template content to target directory
        logger.start('Copying template...');
        cpSync(template.templateDir, targetDir, { recursive: true });

        // Rename README.md to TEMPLATE.md in target directory
        renameSync(join(targetDir, 'README.md'), join(targetDir, 'TEMPLATE.md'));

         // Copy template resources to target directory
         for (const resource of template.resources) {
           const targetPath = resource.target ?? join(targetDir, resource.path.split('/').pop() ?? '');
           
           // Check if source exists before copying
           if (existsSync(resource.path)) {
             logger.debug(`Copying resource: ${resource.path} -> ${targetPath}`);
             cpSync(resource.path, targetPath, { recursive: !!resource.recursive });
           } else {
             logger.warn(`Resource not found, skipping: ${resource.path}`);
           }
         }

        logger.succeed('Template copied successfully!');

        // Ask user if they want to install dependencies
        const installDeps = await promptForDependencyInstallation();
        
        if (installDeps) {
          try {
            await installDependencies(targetDir, logger);
          } catch (error) {
            logger.error('Failed to install dependencies. You can run "pnpm install" manually later.');
          }
        }

        console.log(chalk.green('\n✅ Application created successfully!'));
        console.log(chalk.blue('\nNext steps:'));
        console.log(`  cd ${name}`);
        if (!installDeps) {
          console.log('  pnpm install');
        }
        console.log('  pnpm dev');

        // Ask user if they want to remove temporary files
        const removeTempFiles = await promptForTempFileCleanup();

        if (removeTempFiles) {
          logger.start('Removing temporary files...');
          cleanupTemplateDir(templateRoot);
          logger.succeed('Temporary files removed.');
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    },
  );

export default command;
