import { createHash } from 'node:crypto';
import { hostname, networkInterfaces } from 'node:os';

import type { Command, Option } from 'commander';

/** Top-level commands shipped with the CLI; any other top-level command comes from a plugin. */
export const BUILT_IN_COMMANDS: ReadonlySet<string> = new Set([
  'app',
  'auth',
  'create',
  'disco',
  'portal',
  'telemetry',
]);

/** Fusion environments that may be reported; any other `--env` value is never exported. */
const KNOWN_FUSION_ENVIRONMENTS: ReadonlySet<string> = new Set(['ci', 'fqa', 'tr', 'fprd', 'dev']);

/** Static shape of an invocation, resolved from argv against the registered commands. */
export interface InvocationCommand {
  /** Registered command names from the root, e.g. `['app', 'build']`; empty for the root. */
  path: string[];
  /** Registered option names used, e.g. `['--env', '--silent']`; never option values. */
  optionNames: string[];
  /** Whether the top-level command is built in or contributed by a plugin. */
  kind: 'builtin' | 'plugin';
}

/** Returns the long name of an option, falling back to the short flag. */
const optionName = (option: Option): string | undefined => option.long ?? option.short;

/** Finds a registered option, on the command or any ancestor, by its flag. */
const findOption = (chain: readonly Command[], flag: string): Option | undefined => {
  for (const command of chain) {
    const match = command.options.find((option) => option.long === flag || option.short === flag);
    if (match) return match;
  }
  return undefined;
};

/**
 * Expands an option token into the registered options it uses, following Commander's rules:
 * `-abc` is `-a -b -c` while each is a boolean flag, and the first value-taking short option
 * takes the rest of the group (`-efprd` is `-e` with value `fprd`). Values are never returned.
 *
 * @returns The matched options and whether the last one still expects a value in the next token.
 */
const expandOptionToken = (
  chain: readonly Command[],
  token: string,
): { options: Option[]; awaitsValue: boolean } => {
  const [flag, inlineValue] = token.split('=', 2);
  const option = findOption(chain, flag);
  if (option) {
    const takesValue = option.required || option.optional;
    return { options: [option], awaitsValue: takesValue && inlineValue === undefined };
  }
  // Only single-dash groups such as `-ds` or `-efprd` can combine short options.
  if (token.startsWith('--') || token.length <= 2) return { options: [], awaitsValue: false };
  const options: Option[] = [];
  for (let index = 1; index < token.length; index++) {
    const short = findOption(chain, `-${token[index]}`);
    if (!short) break;
    options.push(short);
    if (short.required || short.optional) {
      return { options, awaitsValue: index === token.length - 1 };
    }
  }
  return { options, awaitsValue: false };
};

/**
 * Resolves the static command path and the names of registered options from argv.
 *
 * Only tokens that match registered command or option names are kept, so argument values,
 * option values and unknown flags — which may hold tokens, paths or other secrets — are dropped.
 *
 * @param program - Root command with all built-in and plugin commands registered.
 * @param args - User arguments, i.e. `process.argv.slice(2)`.
 * @returns The command path, option names and command kind.
 */
export const resolveInvocationCommand = (
  program: Command,
  args: readonly string[],
): InvocationCommand => {
  const chain: Command[] = [program];
  const path: string[] = [];
  const optionNames = new Set<string>();
  let walkingCommands = true;

  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    // Everything after `--` is passed through verbatim and never inspected.
    if (token === '--') break;
    if (token.startsWith('-') && token.length > 1) {
      const flag = token.split('=', 1)[0];
      if (flag === '-h' || flag === '--help') {
        optionNames.add('--help');
        continue;
      }
      const { options, awaitsValue } = expandOptionToken(chain, token);
      for (const option of options) {
        const name = optionName(option);
        if (name) optionNames.add(name);
      }
      const last = options[options.length - 1];
      if (!last || !awaitsValue) continue;
      // Skip the separate value token so it is never mistaken for a command name.
      const next = args[index + 1];
      const consumesNext =
        last.required || (last.optional && next !== undefined && !next.startsWith('-'));
      if (consumesNext) index++;
      continue;
    }
    if (!walkingCommands) continue;
    const current = chain[chain.length - 1];
    const next = current.commands.find(
      (command) => command.name() === token || command.aliases().includes(token),
    );
    if (next) {
      chain.push(next);
      path.push(next.name());
    } else {
      // The first positional argument ends the command path; its value is never kept.
      walkingCommands = false;
    }
  }

  const kind = path.length === 0 || BUILT_IN_COMMANDS.has(path[0]) ? 'builtin' : 'plugin';
  return { path, optionNames: [...optionNames].sort(), kind };
};

/**
 * Returns the type name of a thrown value, never its message or stack.
 *
 * @param error - Value that terminated the invocation.
 * @returns A plain identifier such as `TypeError`, or `Error` when no safe name exists.
 */
export const resolveExceptionType = (error: unknown): string => {
  if (error === null || typeof error !== 'object') return typeof error;
  const name = (error as { constructor?: { name?: unknown } }).constructor?.name;
  return typeof name === 'string' && /^[A-Za-z_$][\w$]{0,63}$/.test(name) ? name : 'Error';
};

/**
 * Returns the target Fusion environment when it is one of the known environments.
 * Custom values may identify private infrastructure, so they are never reported.
 *
 * @param value - Value of the command's `--env` option.
 * @returns The lower-case environment name, or `undefined`.
 */
export const resolveFusionEnvironment = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const env = value.trim().toLowerCase();
  return KNOWN_FUSION_ENVIRONMENTS.has(env) ? env : undefined;
};

/**
 * Returns a stable, one-way machine identifier, so usage can be counted per machine without
 * exporting host names or hardware addresses.
 *
 * @param interfaces - Network interfaces; defaults to the host's.
 * @param host - Host name used when no hardware address exists; defaults to the host's.
 * @returns Hex SHA-256 of the first external hardware address, or of the host name.
 */
export const createMachineId = (
  interfaces: ReturnType<typeof networkInterfaces> = networkInterfaces(),
  host: string = hostname(),
): string => {
  const mac = Object.values(interfaces)
    .flat()
    .find(
      (entry) => entry && !entry.internal && entry.mac && entry.mac !== '00:00:00:00:00:00',
    )?.mac;
  return createHash('sha256')
    .update(`fusion-framework-cli:${mac ?? host}`)
    .digest('hex');
};
