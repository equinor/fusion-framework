import type { AgentBrowserToolList } from './types.js';

/**
 * Ordered collection of agent-browser tool registrations for a Copilot session.
 *
 * Tools are exposed to the model in insertion order. Use {@link addTools} to
 * register multiple tools at once during session setup.
 */
export class AgentBrowserToolRegistry {
  private readonly tools: AgentBrowserToolList = [];

  /**
   * Adds a tool to the registry.
   *
   * @param tool - Tool definition created with the Copilot SDK `defineTool` helper
   */
  addTool(tool: AgentBrowserToolList[number]): void {
    this.tools.push(tool);
  }

  /**
   * Adds multiple tools to the registry in order.
   *
   * @param tools - Tool definitions created with the Copilot SDK `defineTool` helper
   */
  addTools(...tools: AgentBrowserToolList): void {
    this.tools.push(...tools);
  }

  /**
   * Returns the registered tools in insertion order.
   *
   * @returns The registered Copilot SDK tool list
   */
  getTools(): AgentBrowserToolList {
    return this.tools;
  }
}
