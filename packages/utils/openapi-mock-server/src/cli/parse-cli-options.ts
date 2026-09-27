import { resolve } from 'node:path';

interface CliOptions {
  port: number;
  seed?: number;
  allowedOrigins: string[];
  sources: string[];
}

/**
 * Parses mock-server CLI flags and source arguments without discarding positional sources when optional flags are absent.
 *
 * @param args - The CLI's own argv, without `node` and the script path.
 * @returns Parsed port, seed, allowed origins, and mock sources in precedence order.
 */
export function parseCliOptions(args: string[]): CliOptions {
  const ignoredIndexes = new Set<number>();

  /** Records a value-taking flag only when it is actually present. */
  const readNumberFlag = (flag: string, fallback?: number): number | undefined => {
    const index = args.indexOf(flag);
    // An absent flag contributes no indexes; treating `-1 + 1` as index zero drops the first source.
    if (index === -1) return fallback;
    ignoredIndexes.add(index);
    ignoredIndexes.add(index + 1);
    return args[index + 1] ? Number(args[index + 1]) : fallback;
  };

  /** Collects every repeatable string flag while excluding it from positional sources. */
  const readStringFlags = (flag: string): string[] => {
    const values: string[] = [];
    // Preserve declaration order so diagnostics and generated configuration remain predictable.
    for (const [index, argument] of args.entries()) {
      // Support the conventional `--flag value` form.
      if (argument === flag) {
        ignoredIndexes.add(index);
        ignoredIndexes.add(index + 1);
        const value = args[index + 1];
        // A missing value contributes no origin and remains visible through later validation.
        if (value) values.push(value);
        // This argument cannot also be an equals-form flag or positional source.
        continue;
      }
      // Support the equivalent `--flag=value` form.
      if (argument.startsWith(`${flag}=`)) {
        ignoredIndexes.add(index);
        values.push(argument.slice(flag.length + 1));
      }
    }
    return values;
  };

  const port = readNumberFlag('--port', 0) ?? 0;
  const seed = readNumberFlag('--seed');
  const allowedOrigins = readStringFlags('--allow-origin');
  const sources = args
    // Exclude value-taking flags and their values from source parsing.
    .filter((_, index) => !ignoredIndexes.has(index))
    // Preserve source order because later sources override earlier services by key.
    .map((arg) => {
      // An explicit preset flag names a bundled preset.
      if (arg.startsWith('--preset=')) return arg.slice('--preset='.length);
      // Unknown flags aren't mock directories.
      if (arg.startsWith('--')) return undefined;
      return resolve(arg);
    })
    // Remove unknown flags while retaining directories and preset names.
    .filter((source): source is string => source !== undefined);

  return { port, seed, allowedOrigins, sources: sources.length > 0 ? sources : ['./mocks'] };
}
