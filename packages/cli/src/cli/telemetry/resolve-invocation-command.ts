import type { Command, Option } from 'commander';

/** Static shape of an invocation, resolved from argv against the registered commands. */
export interface InvocationCommand {
  /** Registered command names from the root, e.g. `['app', 'build']`; empty for the root. */
  path: string[];
  /** Registered option names used, e.g. `['--env', '--silent']`; never option values. */
  optionNames: string[];
  /** Whether the top-level command is built in or contributed by a plugin. */
  kind: 'builtin' | 'plugin';
}

/** Top-level commands shipped with the CLI; any other top-level command comes from a plugin. */
const BUILT_IN_COMMANDS: ReadonlySet<string> = new Set([
  'app',
  'auth',
  'create',
  'disco',
  'portal',
  'telemetry',
]);

/** Returns the long name of an option, falling back to the short flag. */
const optionName = (option: Option): string | undefined => option.long ?? option.short;

/** Finds a registered option, on the command or any ancestor, by its flag. */
const findOption = (chain: readonly Command[], flag: string): Option | undefined => {
  // Search every registered command so telemetry records only recognized flags.
  for (const command of chain) {
    // The nearest command with this flag determines the option's registered name.
    const match = command.options.find((option) => option.long === flag || option.short === flag);
    // Stop at the nearest command that owns the requested flag.
    if (match) return match;
  }
  return undefined;
};

/**
 * Expands an option token into the registered options it uses, following Commander's rules:
 * `-abc` is `-a -b -c` while each is a boolean flag, and the first value-taking short option
 * takes the rest of the group (`-efprd` is `-e` with value `fprd`). Values are never returned.
 *
 * @param chain - Current command and its ancestors.
 * @param token - One argument token.
 * @returns The matched options and whether the last one still expects a value in the next token.
 */
const expandOptionToken = (
  chain: readonly Command[],
  token: string,
): { options: Option[]; awaitsValue: boolean } => {
  const [flag, inlineValue] = token.split('=', 2);
  // An exact registered option takes precedence over grouped short-option parsing.
  const option = findOption(chain, flag);
  // Use Commander's exact option definition when one matches.
  if (option) {
    const takesValue = option.required || option.optional;
    return { options: [option], awaitsValue: takesValue && inlineValue === undefined };
  }
  // Long options and single-character tokens cannot form short-option groups.
  if (token.startsWith('--') || token.length <= 2) return { options: [], awaitsValue: false };
  const options: Option[] = [];
  // Expand a short group only while each character maps to a registered option.
  for (let index = 1; index < token.length; index++) {
    const short = findOption(chain, `-${token[index]}`);
    // An unknown character ends parsing of this short-option group.
    if (!short) break;
    options.push(short);
    // A value-taking option consumes the rest of the token, if present.
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

  // Walk argv once, retaining only registered command and option names.
  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    // Passthrough arguments may contain secrets and are never inspected.
    if (token === '--') break;
    // Parse option names without retaining their values.
    if (token.startsWith('-') && token.length > 1) {
      const flag = token.split('=', 1)[0];
      // Help is handled specially by Commander and may not be registered on the command.
      if (flag === '-h' || flag === '--help') {
        optionNames.add('--help');
        // Help has no value and does not change the command path.
        continue;
      }
      const { options, awaitsValue } = expandOptionToken(chain, token);
      // Add only names from Commander's registered option definitions.
      for (const option of options) {
        const name = optionName(option);
        // Ignore options that have no stable long or short name.
        if (name) optionNames.add(name);
      }
      const last = options[options.length - 1];
      // No registered value-taking option means there is no separate token to skip.
      if (!last || !awaitsValue) continue;
      // Skip a separate option value before it can be mistaken for a subcommand.
      const next = args[index + 1];
      const consumesNext =
        last.required || (last.optional && next !== undefined && !next.startsWith('-'));
      // Advance over values separately from the option token so they are not inspected.
      if (consumesNext) index++;
      // Option tokens never determine the registered command path.
      continue;
    }
    // Positional values end command lookup and are never included in the telemetry record.
    if (!walkingCommands) continue;
    const current = chain[chain.length - 1];
    // Match only registered command names and aliases along the active command path.
    const next = current.commands.find(
      (command) => command.name() === token || command.aliases().includes(token),
    );
    // Extend the command path only for Commander-registered names or aliases.
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
