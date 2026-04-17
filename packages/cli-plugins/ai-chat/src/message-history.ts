import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';

/** Compression threshold — summarise when history reaches this size. */
const COMPRESS_AT = 10;
/** Number of oldest messages to fold into a summary. */
const COMPRESS_TAKE = 5;

/**
 * Manages a bounded conversation history with AI-based summarisation.
 *
 * When the history reaches {@link COMPRESS_AT} messages the oldest
 * {@link COMPRESS_TAKE} entries are replaced with a single summary message
 * produced by the provided `summarise` callback. A hard {@link limit} is
 * then enforced by dropping the oldest non-summary messages.
 *
 * @example
 * ```ts
 * const history = new MessageHistory(20, async (msgs) => {
 *   const text = await chatModel.invoke([{ role: 'user', content: summarisePrompt(msgs) }]);
 *   return { role: 'assistant', content: `[Summary: ${text}]` };
 * });
 *
 * await history.add({ role: 'user', content: 'Hello' });
 * chain.invoke({ messages: history.messages });
 * ```
 */
export class MessageHistory {
  readonly #limit: number;
  readonly #summarise: (messages: ChatMessage[]) => Promise<ChatMessage>;
  readonly #history: ChatMessage[] = [];

  /**
   * @param limit - Maximum number of messages to retain after compression.
   * @param summarise - Async callback that reduces an array of messages to a
   *   single summary {@link ChatMessage}.
   */
  constructor(limit: number, summarise: (messages: ChatMessage[]) => Promise<ChatMessage>) {
    this.#limit = limit;
    this.#summarise = summarise;
  }

  /** Read-only snapshot of the current message history. */
  get messages(): readonly ChatMessage[] {
    return this.#history;
  }

  /** Removes all messages from the history. */
  clear(): void {
    this.#history.length = 0;
  }

  /**
   * Appends `message` and applies compression / truncation as needed.
   *
   * @param message - The {@link ChatMessage} to add.
   */
  async add(message: ChatMessage): Promise<void> {
    this.#history.push(message);

    // Stage 1: compress when threshold is reached
    if (this.#history.length >= COMPRESS_AT) {
      const oldest = this.#history.splice(0, COMPRESS_TAKE);
      const summary = await this.#summarise(oldest);
      this.#history.unshift(summary);
    }

    // Stage 2: enforce hard limit, preserving a leading summary if present.
    // Detect whether the first message is a summary (from this or a previous
    // compression pass) by checking for the marker prefix.
    if (this.#history.length > this.#limit) {
      const hasSummary =
        this.#history[0]?.content?.toString().startsWith('[Previous conversation summary:') ??
        false;
      const excess = this.#history.length - this.#limit;
      const startIndex = hasSummary ? 1 : 0;
      const maxRemovable = this.#history.length - (hasSummary ? 2 : 1);
      const toRemove = Math.min(excess, Math.max(0, maxRemovable));
      if (toRemove > 0) {
        this.#history.splice(startIndex, toRemove);
      }
    }
  }
}
