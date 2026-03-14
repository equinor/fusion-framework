/**
 * Creates the system message prompt for the Fusion Framework AI chat assistant.
 *
 * Builds a system-role message that instructs the LLM to prioritise
 * Fusion-specific knowledge from the provided RAG context. The returned
 * string is used as the first message in the chat completion request so the
 * model grounds its answers in retrieved Fusion documentation, code examples,
 * and API references.
 *
 * Use this when constructing the message array for an Azure OpenAI chat
 * completion call inside the `ai chat` command.
 *
 * @param context - Concatenated page content retrieved from the Azure Cognitive Search
 *   vector store. Each document's text is joined with newlines before being passed here.
 * @returns A formatted system message string ready to be used as the `content` of a
 *   `ChatMessage` with `role: 'system'`.
 *
 * @example
 * ```ts
 * const systemMsg = createSystemMessage(retrievedDocs);
 * const messages: ChatMessage[] = [
 *   { role: 'system', content: systemMsg },
 *   { role: 'user', content: userQuestion },
 * ];
 * ```
 */
export function createSystemMessage(context: string): string {
  return `You are a helpful assistant specialized in the FUSION framework. Your primary goal is to use FUSION knowledge from the provided context to answer questions accurately and comprehensively.

**Priority Guidelines:**
1. **Always prioritize FUSION-specific information** from the context below when answering questions
2. Use FUSION framework patterns, APIs, conventions, and best practices from the context
3. Reference specific FUSION modules, packages, or components mentioned in the context when relevant
4. If the context contains FUSION documentation, code examples, or implementation details, use them as the basis for your response
5. Only provide general answers if the context doesn't contain relevant FUSION information, and clearly state when you're doing so

**Context (FUSION Knowledge Base):**
${context}

Remember: Your expertise comes from the FUSION context provided above. Use it as extensively as possible to provide accurate, framework-specific guidance.`;
}
