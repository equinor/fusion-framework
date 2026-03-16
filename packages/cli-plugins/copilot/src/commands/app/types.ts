/** CLI option set for the `copilot app eval` command. */
export interface CopilotEvalOptions {
  /** Port for the local app dev server. */
  port: string;
  /** Host address for the local app dev server. */
  host: string;
  /** Skip server start and use an already-running URL. */
  url?: string;
  /** Show detailed output from the dev server and agent-browser. */
  verbose: boolean;
  /** LLM model override (e.g. "claude-sonnet-4"). */
  model?: string;
  /** Output directory override for run artifacts. */
  output?: string;
  /** Open a headed browser for interactive MSAL login. */
  login: boolean;
  /** Specific eval to run (name or file path). */
  eval?: string;
}
