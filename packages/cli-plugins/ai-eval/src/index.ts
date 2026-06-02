/**
 * @packageDocumentation
 *
 * Fusion Framework CLI plugin for agentic acceptance testing.
 *
 * Registers the `ffc ai eval <path>` command which runs a 4-phase pipeline
 * (Plan → Explore → Sanitise → Judge) against a locally running Fusion app.
 *
 * ## Usage
 *
 * ```bash
 * ffc ai eval ./cookbooks/app-react/eval/01-landing-page.md --url http://localhost:3000
 * ffc ai eval ./cookbooks/app-react/eval/ --url http://localhost:3000 --verbose
 * ```
 *
 * ## Registration
 *
 * This plugin is loaded automatically by `fusion-cli.config.ts`. If you are
 * using a custom CLI configuration, register it with:
 *
 * ```typescript
 * import registerEvalPlugin from '@equinor/fusion-framework-cli-plugin-ai-eval';
 *
 * registerEvalPlugin(program);
 * ```
 *
 * @module @equinor/fusion-framework-cli-plugin-ai-eval
 */

import type { Command } from 'commander';
import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as evalCommand } from './command.js';
import { browserCommand } from './login.js';
import { judgeCommand } from './judge-command.js';

/**
 * Registers the `ffc ai eval` command with the CLI program.
 *
 * @param program - The root Commander program from the Fusion CLI.
 */
export function registerEvalPlugin(program: Command): void {
  registerAiPlugin(program, evalCommand);
  registerAiPlugin(program, browserCommand);
  registerAiPlugin(program, judgeCommand);
}

export default registerEvalPlugin;
