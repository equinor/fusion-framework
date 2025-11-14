import { useEffect, useState } from 'react';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import type { AIModule } from '@equinor/fusion-framework-module-ai';
import type { IVectorStore, IModel } from '@equinor/fusion-framework-module-ai/lib';

import type { BaseRetriever } from '@langchain/core/retrievers';

// import { createOpenAIToolsAgent, AgentExecutor } from 'langchain/agents';
import { createOpenAIToolsAgent, AgentExecutor } from '@langchain/classic/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// import { ConversationSummaryBufferMemory } from 'langchain/memory';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { AIMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages';
import { createAzureSearchRetrieverTool } from '../tools/create-azure-search-tool';
import { useServiceDiscoveryTool } from './useServiceDiscoveryTool';
// import { useServiceSwaggerTool } from './useServiceSwaggerTool'; 
import { usePersonTool } from './usePersonTool';
import { usePersonSearchTool } from './usePersonSearchTool';
import { useApplicationChooserTool } from './useApplicationChooserTool';

const history = new WeakMap();
class myHistory extends BaseChatMessageHistory {
  lc_namespace = ['my', 'history'];
  async getMessages(): Promise<BaseMessage[]> {
    console.log('getMessages', history.get(this));
    return Promise.resolve(history.get(this) || []);
  }
  async addMessage(message: BaseMessage): Promise<void> {
    console.log('addMessage', message);
    const messages = history.get(this) || [];
    history.set(this, [...messages, message]);
  }
  async clear(): Promise<void> {
    console.log('clear');
    history.delete(this);
  }

  addAIChatMessage(message: string): Promise<void> {
    return this.addMessage(new AIMessage({ content: message }));
  }

  addUserMessage(message: string): Promise<void> {
    return this.addMessage(new HumanMessage({ content: message }));
  }
  addAIMessage(message: string): Promise<void> {
    return this.addMessage(new AIMessage({ content: message }));
  }
}

interface UseAIAgentOptions {
  /** Number of documents to retrieve (default: 5) */
  k?: number;
  /** Search type: 'similarity' or 'mmr' (default: 'similarity') */
  searchType?: 'similarity' | 'mmr';
}

/**
 * Custom hook for creating and managing an AI agent with tools.
 *
 * @param options - Configuration options for the agent
 * @param options.k - Number of documents to retrieve
 * @param options.searchType - Search type
 * @returns An agent executor that can use tools, or null if the AI module is not available
 */
export const useAIAgent = (_options?: UseAIAgentOptions): AgentExecutor | null => {
  const aiModule = useAppModule<AIModule>('ai');
  const serviceDiscoveryTool = useServiceDiscoveryTool();
  // const serviceSwaggerInfoTool = useServiceSwaggerTool();
  const personTool = usePersonTool();
  const personSearchTool = usePersonSearchTool();
  const applicationChooserTool = useApplicationChooserTool();
  const [agent, setAgent] = useState<AgentExecutor | null>(null);

  useEffect(() => {
    if (!aiModule) {
      setAgent(null);
      return;
    }

    const initializeAgent = async () => {
      const chatService = aiModule.getService('chat', 'reasoning');
      const nonReasoningLlm = aiModule.getService('chat', 'non-reasoning');
      const vectorStore = aiModule.getService('search', 'default') as IVectorStore;

      // Create retriever functions
      const tsdocRetriever = vectorStore.asRetriever({
        filter: { 'metadata/attributes/type': 'tsdoc' },
      }) as unknown as BaseRetriever;

      const mdRetriever = vectorStore.asRetriever({
        filter: { 'metadata/attributes/type': 'md' },
      }) as unknown as BaseRetriever;

      const tsdocTool = createAzureSearchRetrieverTool(tsdocRetriever, {
        name: 'tsdoc_retriever',
        description:
          'ESSENTIAL for code generation: Search TypeScript API docs, function signatures, type definitions, interface contracts, and implementation examples. Use this FIRST when writing code, creating hooks, or implementing APIs.',
        model: nonReasoningLlm,
      });

      const mdTool = createAzureSearchRetrieverTool(mdRetriever, {
        name: 'md_retriever',
        description:
          'Search guides, workflows, architecture docs, and conceptual explanations. Use for understanding processes, setup instructions, and high-level overviews - NOT for code implementation details.',
        model: nonReasoningLlm,
      });

      const agent = await createOpenAIToolsAgent({
        /** @ts-expect-error - TODO: fix this */
        llm: chatService.llm,
        tools: [tsdocTool, mdTool, serviceDiscoveryTool, personTool, personSearchTool, applicationChooserTool],
        prompt: ChatPromptTemplate.fromMessages([
          [
            'system',
            [
              'You are a senior Fusion Framework expert and technical consultant with deep knowledge of the entire Fusion Framework ecosystem, including:',
              '- Core framework architecture and module system',
              '- React integration patterns and component libraries',
              '- CLI tooling and development workflows',
              '- Monorepo structure and package management',
              '- Authentication and authorization patterns',
              '- Service integration and API consumption',
              '- Build systems, bundling, and deployment',
              '- Best practices, conventions, and architectural patterns',
              '',
              'EXPERTISE LEVEL: You provide senior-level technical guidance comparable to an experienced Fusion Framework architect or lead developer.',
              '',
              'TOOL SELECTION INTELLIGENCE:',
              '- md_retriever: Use for conceptual questions, architectural overviews, guides, processes, and "how things work" explanations',
              '- tsdoc_retriever: Use for detailed API documentation, code examples, type definitions, function signatures, and implementation details',
              '- service_discovery: Use for finding available services, endpoints, APIs, and service metadata',
              '- person_search: Use for finding team members, contacts, and organizational information',
              '- application_chooser: Use for finding Fusion Framework cookbooks, example applications, and learning resources',
              '- Analyze query intent first, then select the most efficient tool combination',
              '- Prefer single targeted searches over broad exploration unless the query requires comprehensive analysis',
              '- If results are insufficient, explain why and suggest follow-up searches',
              '',
              'RESPONSE PHILOSOPHY:',
              '- Be thorough but concise - provide complete information without unnecessary verbosity',
              '- Focus on practical, actionable guidance that developers can immediately apply',
              '- Explain both WHAT the solution does and WHY it works that way in the Fusion Framework context',
              '- Include production-ready examples with proper error handling and best practices',
              '- Reference specific files, functions, and patterns from the actual codebase',
              '- Highlight framework-specific conventions and architectural decisions',
              '',
              'TECHNICAL DEPTH REQUIREMENTS:',
              '- Explain implementation details, configuration options, and integration patterns',
              '- Provide parameter descriptions, return types, and usage examples for APIs',
              '- Include import statements, dependencies, and setup requirements',
              '- Show complete working examples, not just code fragments',
              '- Explain framework-specific patterns (modules, services, hooks, etc.)',
              '- Cover error handling, edge cases, and performance considerations',
              '',
              'CODE FORMATTING STANDARDS:',
              '- All code examples must be in properly formatted markdown code blocks',
              '- Include language tags (typescript, javascript, json, bash, etc.)',
              '- Show complete, runnable examples with imports and setup',
              '- Use Fusion Framework naming conventions and patterns',
              '- Include comments explaining complex logic or framework-specific decisions',
              '',
              'RESOURCE ATTRIBUTION:',
              '- Always explain which tools were used and why they were chosen for the specific query',
              '- Reference specific documentation sources, file paths, and code locations',
              '- Explain the reasoning behind tool selection based on query analysis',
              '- If multiple sources were needed, explain how they complement each other',
              '- Be transparent about information completeness and suggest additional research if needed',
              '',
              'PERSON INFORMATION DISPLAY:',
              '- Render person cards directly in responses: <fwc-person-card azureId="ID" /> or <fwc-person-card upn="email" />',
              '- Never put person cards in code blocks',
              '- Use person search results to provide contact information and team context',
              '',
              'RESPONSE STRUCTURE:',
              '1. TOOL USAGE SUMMARY: Briefly explain which tools were used and why',
              '2. SOLUTION OVERVIEW: High-level explanation of the approach and why it fits the Fusion Framework',
              '3. DETAILED IMPLEMENTATION: Complete working examples with explanations',
              '4. FRAMEWORK CONTEXT: How this fits into the broader Fusion Framework architecture',
              '5. BEST PRACTICES: Additional guidance, performance tips, and common pitfalls',
              '6. FURTHER RESOURCES: Related documentation, examples, or additional tools to explore',
              '',
              'QUALITY ASSURANCE:',
              '- Verify all code examples are syntactically correct and follow Fusion Framework conventions',
              '- Ensure examples include proper TypeScript types and error handling',
              '- Cross-reference information across multiple sources when possible',
              '- Admit uncertainty and suggest verification rather than guessing',
              '- Focus on current best practices and up-to-date patterns from the codebase',
            ].join('\n'),
          ],
          ['placeholder', '{chat_history}'],
          ['human', '{input}'],
          ['placeholder', '{agent_scratchpad}'],
        ]),
      });

      const executor = new AgentExecutor({
        agent,
        tools: [tsdocTool, mdTool, serviceDiscoveryTool, personTool, personSearchTool, applicationChooserTool],
        verbose: false,
        returnIntermediateSteps: true,
      });

      setAgent(executor);
    };

    initializeAgent();
  }, [aiModule, serviceDiscoveryTool, personTool, personSearchTool, applicationChooserTool]);

  return agent;
};

export default useAIAgent;
