/**
 * Represents an error that is thrown when a specified file cannot be found.
 *
 * @extends {Error}
 *
 * @param message - A descriptive message providing details about the missing file.
 * @param options - Optional error options that can be used to provide additional context.
 */
export class FileNotFoundError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Represents an error that occurs when a file is not accessible.
 *
 * @extends Error
 * @param message - A descriptive message providing details about the error.
 * @param options - Optional error options that can include additional metadata or cause information.
 */
export class FileNotAccessibleError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotAccessibleError';
  }
}

/**
 * Processes an access error and throws a specific error based on the error code.
 *
 * @param error - The error object to process, typically of type `unknown`.
 * @param path - The file path associated with the error.
 *
 * @throws FileNotFoundError - If the error code is `ENOENT`, indicating the file was not found.
 * @throws FileNotAccessibleError - If the error code is `EACCES`, indicating the file is not accessible.
 * @throws Error - For any other error codes, indicating an unknown error occurred.
 */
export const processAccessError = (error: unknown, path: string): Error => {
  switch ((error as NodeJS.ErrnoException).code) {
    case 'ENOENT':
      return new FileNotFoundError(`File not found: ${path}`, { cause: error });
    case 'EISDIR':
      return new FileNotAccessibleError(`Path is a directory: ${path}`, { cause: error });
    case 'EACCES':
      return new FileNotAccessibleError(`File not accessible: ${path}`, { cause: error });
    default:
      return new Error(`Unknown error accessing: ${path}`, { cause: error });
  }
};
