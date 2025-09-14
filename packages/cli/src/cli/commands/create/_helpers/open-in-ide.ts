import { execa } from 'execa';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Prompts the user to open the newly created project in their preferred IDE.
 *
 * Displays a selection menu with supported IDEs (VS Code, Cursor) and executes
 * the appropriate command to open the project directory. If the user chooses
 * not to open an IDE, the function completes without action.
 *
 * @param targetDir - Absolute path to the project directory to open
 * @param logger - Console logger for displaying prompts and instructions
 * @returns Promise that resolves when the IDE selection process is complete
 */
export async function openInIDE(targetDir: string, logger: ConsoleLogger): Promise<void> {
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
    try {
      // Spawn detached process for IDE opening - IDE should run independently of CLI
      const child = execa(openInIDE, [targetDir], {
        stdio: 'inherit',
      });

      // Handle process completion
      child.then(
        () => {
          // Process completed successfully
        },
        (error: { exitCode?: number; message: string }) => {
          if (error.exitCode !== 0) {
            logger.error(
              `IDE process exited with code ${error.exitCode}. The IDE may not have opened successfully.`,
            );
          } else {
            logger.error(`Failed to open IDE (${openInIDE}): ${error.message}`);
          }
        },
      );
    } catch (error) {
      logger.error(
        `Failed to spawn IDE process (${openInIDE}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export default openInIDE;
