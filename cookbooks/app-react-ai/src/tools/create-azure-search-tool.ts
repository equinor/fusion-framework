import z from 'zod';
import { tool } from '@langchain/core/tools';
import type { BaseRetriever } from '@langchain/core/retrievers';
import type { DynamicStructuredTool } from '@langchain/core/tools';
import type { IModel } from '@equinor/fusion-framework-module-ai/lib';

const AzureSearchRetrieverToolSchema = z.object({
  query: z.string(),
});
export const createAzureSearchRetrieverTool = (
  retriever: BaseRetriever,
  fields: { name: string; description: string; model: IModel },
): DynamicStructuredTool =>
  tool(
    async ({ query }: { query: string }) => {
      const results = await retriever.invoke(query);
      const formattedResults = results
        .map(
          (doc: { pageContent: string; metadata: Record<string, unknown> }, index: number) => {
            const metadata = doc.metadata || {};
            const source = metadata.source || 'Unknown source';
            const attributes = metadata.attributes || {};
            const rootPath = metadata.rootPath || '';

            return `[Document ${index + 1}]
Source: ${source}
${rootPath ? `Path: ${rootPath}` : ''}
${Object.keys(attributes).length > 0 ? `Attributes: ${JSON.stringify(attributes, null, 2)}` : ''}

Content:
${doc.pageContent}

---`;
          }
        )
        .join('\n\n');

      if (fields.model) {
        const response = await fields.model.invoke([
          {
            role: 'system',
            content: `You are an expert at processing and summarizing Azure Cognitive Search results for Retrieval-Augmented Generation (RAG) applications.

Your task is to transform raw search results into well-structured, concise, and contextually relevant information that an AI agent can effectively use as reference material.

Guidelines:
- Extract and highlight the most relevant information from each document
- Maintain factual accuracy and preserve important technical details
- Organize information in a logical, easy-to-scan format
- Remove redundant or irrelevant metadata
- If multiple documents cover similar topics, synthesize them into coherent summaries
- Prioritize recent, authoritative, and contextually relevant information
- Format the output as clean, structured text suitable for AI consumption
- Keep summaries focused and actionable for the agent's needs`
          },
          {
            role: 'user',
            content: `Please process and summarize the following Azure Cognitive Search results for use in a RAG system:

${formattedResults}

Provide a well-structured summary that captures the key information and context from these search results.`
          },
        ]);
        return response.content;
      }
      return formattedResults;
    },
    { ...fields, schema: AzureSearchRetrieverToolSchema },
  );
