import type { Command, Option } from 'commander';

/** Top-level commands shipped with the CLI; any other top-level command comes from a plugin. */
const BUILT_IN_COMMANDS: ReadonlySet<string> = new Set([
  'app',
  'auth',
  'create',
  'disco',
  'portal',
  'telemetry',
]);

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
  // Prefer the nearest registered option along the command path.
  for (const command of chain) {
    // Preserve the declared long and short spellings for option lookup.
    const match = command.options.find((option) => option.long === flag || option.short === flag);
    // Stop at the first owner to preserve command-path lookup precedence.
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
  // An exact registration takes precedence over interpreting a short-option group.
  if (option) {
    const takesValue = option.required || option.optional;
    return { options: [option], awaitsValue: takesValue && inlineValue === undefined };
  }
  // Only single-dash groups such as `-ds` or `-efprd` can combine short options.
  if (token.startsWith('--') || token.length <= 2) return { options: [], awaitsValue: false };
  const options: Option[] = [];
  // Follow the group's left-to-right order until it reaches a value-taking option.
  for (let index = 1; index < token.length; index++) {
    const short = findOption(chain, `-${token[index]}`);
    // The remainder cannot be attributed to a known registered option.
    if (!short) break;
    options.push(short);
    // The rest of this token is the option's value, not more flags.
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

  // Walk argv in order so values are skipped before they can be read as names.
  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    // Everything after `--` is passed through verbatim and never inspected.
    if (token === '--') break;
    // Resolve flags independently from command descent.
    if (token.startsWith('-') && token.length > 1) {
      const flag = token.split('=', 1)[0];
      // Commander supplies help implicitly, so it need not be registered.
      if (flag === '-h' || flag === '--help') {
        optionNames.add('--help');
        // Do not try to interpret implicit help as part of the command path.
        continue;
      }
      const { options, awaitsValue } = expandOptionToken(chain, token);
      // Keep registered option names only, including names from grouped flags.
      for (const option of options) {
        const name = optionName(option);
        // Omit an option when it has no usable name instead of recording the input.
        if (name) optionNames.add(name);
      }
      const last = options[options.length - 1];
      // With no separate value to consume, handling of this flag is finished.
      if (!last || !awaitsValue) continue;
      // Skip the separate value token so it is never mistaken for a command name.
      const next = args[index + 1];
      const consumesNext =
        last.required || (last.optional && next !== undefined && !next.startsWith('-'));
      // An optional value does not consume the next flag.
      if (consumesNext) index++;
      // Never feed a flag or its value into command lookup.
      continue;
    }
    // Positional arguments end command discovery but not option discovery.
    if (!walkingCommands) continue;
    const current = chain[chain.length - 1];
    const next = current.commands
      // Resolve aliases to the same command as the canonical name.
      .find((command) => command.name() === token || command.aliases().includes(token));
    // Record only a name we found in the registered command tree.
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
