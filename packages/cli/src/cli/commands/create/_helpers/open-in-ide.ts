import { spawn } from 'node:child_process';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Prompt user to open the project in their IDE and execute the command.
 *
 * @param targetDir - Directory path to open in the IDE
 * @param logger - Logger instance for output
 * @returns Promise resolving when IDE opening is complete
 */
export async function openInIDE(targetDir: string, logger: ConsoleLogger): Promise<void> {
  // Ask user if they want to open the project in their IDE
  logger.info('By selecting an IDE, it will be opened in a new window.');
  logger.info('👋 please come back to this terminal to continue.');
  logger.info(
    `You can also open the project in your IDE later by typing e.g. \`code ${targetDir}\` in the terminal.`,
  );
  logger.info('If you do not want to open the project in an IDE, select no.');

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

  if (openInIDE) {
    spawn(openInIDE, [targetDir], {
      stdio: 'inherit',
      shell: true,
    });
  }
}

export default openInIDE;
