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

/**
 * Makes all properties of a type optional, recursively.
 * For array properties, applies the transformation to the array's element type.
 *
 * @template T - The type to make recursively partial.
 *
 * @example
 * type Example = {
 *   a: number;
 *   b: {
 *     c: string;
 *     d: number[];
 *   };
 * };
 * // RecursivePartial<Example> will be:
 * // {
 * //   a?: number;
 * //   b?: {
 * //     c?: string;
 * //     d?: number[];
 * //   };
 * // }
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<Value<U>> : Value<T[P]>;
};

type AllowedPrimitives =
  // biome-ignore lint/complexity/noBannedTypes: no better way to do this?
  | Function
  | boolean
  | string
  | number
  | Date /* add any types than should be considered as a value, say, DateTimeOffset */;

type Value<T> = T extends AllowedPrimitives ? T : RecursivePartial<T>;
