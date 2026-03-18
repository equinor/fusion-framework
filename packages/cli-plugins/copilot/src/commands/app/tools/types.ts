import type { SessionConfig, defineTool } from '@github/copilot-sdk';

/** Shared runtime context passed to every agent-browser tool factory. */
export interface AgentBrowserToolContext {
  /** Directory where evidence artifacts for the current eval run are stored. */
  outDir: string;
  /** Executes an `agent-browser` command and returns its stdout. */
  invoke: (args: string[], timeoutMs?: number) => string;
}

/** Type-only alias for the Copilot SDK `defineTool` helper. */
export type DefineTool = typeof defineTool;

/** Copilot SDK tool list type used by the registry. */
export type AgentBrowserToolList = NonNullable<SessionConfig['tools']>;
