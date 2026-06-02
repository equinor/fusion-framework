/** Options shared across agent phases. */
export interface AgentOptions {
  /** Print verbose output to console (tool calls, model responses). */
  verbose?: boolean;
  /**
   * Absolute path to a `.jsonl` file where each tool call (name, args, response)
   * will be appended as a newline-delimited JSON record during evidence collection.
   */
  toolLogPath?: string;
}
