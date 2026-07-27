/**
 * Prints a CLI resolution error and exits the current process.
 *
 * @param message - Primary error message.
 * @param detail - Optional follow-up detail shown on the next line.
 * @returns This function never returns because the process exits.
 */
export function exitWithResolutionError(message: string, detail?: string): never {
  console.error(`❌ ${message}`);
  // Only print the detail line when one was provided
  if (detail) {
    console.error(`   ${detail}`);
  }
  process.exit(1);
}
