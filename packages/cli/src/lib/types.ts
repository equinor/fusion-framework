/**
 * Represents the runtime environment configuration for CLI commands.
 *
 * This type is used to pass environment and context information to CLI utilities and configuration loaders.
 *
 * @property command - The CLI command being executed (e.g., 'serve' or 'build').
 * @property mode - The CLI mode (e.g., development, production, etc.).
 * @property root - The root directory of the package (optional).
 * @property isPreview - Indicates if the CLI is running in preview mode (optional).
 * @property environment - The runtime environment, such as 'local' or 'ci' (optional, can be null).
 */
export type RuntimeEnv = {
  /**
   * The CLI command being executed. Used to determine the operation mode for downstream logic.
   * Example: 'serve' or 'build'.
   */
  command: 'serve' | 'build';
  /**
   * The CLI mode, typically used to distinguish between environments like development or production.
   */
  mode: string;
  /**
   * The root directory of the package. Used as a base path for resolving files and configs.
   */
  root?: string;
  /**
   * Indicates if the CLI is running in preview mode. Useful for toggling preview-specific logic.
   */
  isPreview?: boolean;
  /**
   * The runtime environment, such as 'local' or 'ci'. Allows for environment-specific configuration.
   */
  environment?: string | null;
};
