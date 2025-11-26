import { execa } from 'execa';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Allowlist of supported IDE commands for security validation
 * Only these commands are permitted to be executed via execa
 */
const SUPPORTED_IDE_COMMANDS = ['code', 'cursor'] as const;

/**
 * Validates that the provided IDE command is in the allowlist
 * @param command - The IDE command to validate
 * @returns True if the command is supported, false otherwise
 */
function isValidIDECommand(command: string): command is (typeof SUPPORTED_IDE_COMMANDS)[number] {
  return SUPPORTED_IDE_COMMANDS.includes(command as (typeof SUPPORTED_IDE_COMMANDS)[number]);
}

/**
 * Prompts the user to open the newly created project in their preferred IDE.
 *
 * Displays a selection menu with supported IDEs (VS Code, Cursor) and executes
 * the appropriate command to open the project directory. The IDE runs detached
 * and independently of the CLI process. If the user chooses not to open an IDE,
 * the function completes without action. If skip is true, the prompt is skipped.
 *
 * @param targetDir - Absolute path to the project directory to open
 * @param logger - Console logger for displaying prompts and instructions
 * @param skip - If true, skip the IDE opening prompt entirely
 * @returns Promise that resolves when the IDE selection process is complete
 */
export async function openInIDE(
  targetDir: string,
  logger: ConsoleLogger,
  skip = false,
): Promise<void> {
  // Skip IDE opening if requested
  if (skip) {
    logger.debug('Skipping IDE opening');
    return;
  }
  // Display helpful instructions to the user about IDE opening process
  logger.info('By selecting an IDE, it will be opened in a new window.');
  logger.info('👋 please come back to this terminal to continue.');
  logger.info(
    `You can also open the project in your IDE later by typing e.g. \`code ${targetDir}\` in the terminal.`,
  );
  logger.info('If you do not want to open the project in an IDE, select no.');

  // Present IDE selection menu to user with supported options
  const { openInIDE } = await inquirer.prompt([
    {
      type: 'select',
      name: 'openInIDE',
      message: '🚀 Open project in IDE?',
      default: false,
      choices: [
        {
          name: 'VS Code',
          value: 'code',
        },
        {
          name: 'Cursor',
          value: 'cursor',
        },
        {
          name: 'No, I will open the project in my IDE later',
          value: false,
        },
      ],
    },
  ]);

  // Execute the selected IDE command to open the project directory
  if (openInIDE) {
    // Validate IDE command against allowlist for security
    if (!isValidIDECommand(openInIDE)) {
      logger.error(
        `Invalid IDE command: ${openInIDE}. Only supported IDEs are: ${SUPPORTED_IDE_COMMANDS.join(', ')}`,
      );
      return;
    }

    try {
      // Spawn detached process for IDE opening - IDE should run independently of CLI
      // NOTE: Using stdio: 'pipe' to avoid polluting CLI output with IDE messages
      const child = execa(openInIDE, [targetDir], {
        stdio: 'pipe',
        detached: true,
      });

      // Unref the child process to allow CLI to exit while IDE continues running
      child.unref();

      // Handle process errors
      child.catch((error: { exitCode?: number; message: string }) => {
        if (error.exitCode !== undefined && error.exitCode !== 0) {
          logger.error(
            `IDE process exited with code ${error.exitCode}. The IDE may not have opened successfully.`,
          );
        } else {
          logger.error(`Failed to open IDE (${openInIDE}): ${error.message}`);
        }
      });
    } catch (error) {
      logger.error(
        `Failed to spawn IDE process (${openInIDE}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export default openInIDE;
