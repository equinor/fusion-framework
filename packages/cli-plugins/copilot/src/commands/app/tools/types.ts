import type { SessionConfig, defineTool } from '@github/copilot-sdk';

/** Shared runtime context passed to every agent-browser tool factory. */
export interface AgentBrowserToolContext {
  /** Directory where evidence artifacts for the current eval run are stored. */
  evidenceDir: string;
  /** Executes an `agent-browser` command and returns its stdout. */
  runAb: (args: string[], timeoutMs?: number) => string;
  /** Resolves a model-provided artifact path to a safe path inside the evidence directory. */
  resolveEvidencePath: (requestedPath: string | undefined, fallbackName: string) => string;
}

/** Type-only alias for the Copilot SDK `defineTool` helper. */
export type DefineTool = typeof defineTool;

/** Copilot SDK tool list type used by the registry. */
export type AgentBrowserToolList = NonNullable<SessionConfig['tools']>;