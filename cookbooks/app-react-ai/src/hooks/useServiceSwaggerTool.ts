import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import { tool } from '@langchain/core/tools';
import type { DynamicStructuredTool } from '@langchain/core/tools';
import { useMemo } from 'react';
import z from 'zod';
import { from, lastValueFrom } from 'rxjs';
import { mergeMap, scan } from 'rxjs/operators';
import type { IModel } from '@equinor/fusion-framework-module-ai/lib';
import type { AIModule } from '@equinor/fusion-framework-module-ai';
import { useAppModule } from '@equinor/fusion-framework-react-app';

export const useServiceSwaggerTool = (): DynamicStructuredTool => {
  const serviceDiscovery = useFramework().modules.serviceDiscovery;
  const llm = useAppModule<AIModule>('ai').getService('chat', 'non-reasoning');
  return useMemo(() => {
    return tool(
      async (args: { serviceKey: string, context: string }) => {
        const client = await serviceDiscovery.createClient(args.serviceKey);
        const job$ = from([1, 2, 3, 4]).pipe(
          mergeMap((version) => client.json$(`swagger/api-v${version}.0/swagger.json`)),
          scan((acc, curr) => `${acc}\n${JSON.stringify(curr)}`, ''),
        );
        const swaggerInfo = await lastValueFrom(job$);
        const result = await llm.invoke([
          {
            role: 'system',
            content: [
              'You are an expert API analyst. Analyze the provided OpenAPI/Swagger documentation and generate comprehensive, developer-friendly context about the service.',
              '',
              'Extract and summarize the following key information:',
              '1. **Service Overview**: Brief description of what the service does',
              '2. **Authentication**: Required authentication methods, scopes, or tokens',
              '3. **Base URL and Environment**: API endpoints and environments',
              '4. **Key Endpoints**: Most important/commonly used API endpoints with their purposes',
              '5. **Data Models**: Main request/response schemas and data structures',
              '6. **Common Patterns**: Recurring API patterns, conventions, or important notes',
              '7. **Version Information**: API versioning scheme and current versions',
              '',
              'Format your response as a structured summary that developers can quickly understand and use. Focus on practical information that helps with integration and development.',
              '',
              'If the swagger contains multiple versions, compare them and highlight important differences.',
            ].join('\n'),
          },
          {
            role: 'user',
            content: `Analyze this OpenAPI/Swagger documentation and provide a comprehensive service overview:\n\n${swaggerInfo}\n\nContext: ${args.context}`,
          },
        ]);
        return result.content;
      },
      {
        name: 'service_swagger_info',
        description:
          "Retrieves the complete OpenAPI/Swagger documentation for a service by its key. Use this when users ask about service capabilities, API endpoints, request/response schemas, or when you encounter service key references in code like useHttpClient('KEY'). Returns detailed API specification including available endpoints, parameters, response formats, and data models.",
        schema: z.object({
          serviceKey: z.string(
            'The key of the service to retrieve the OpenAPI/Swagger documentation for',
          ),
          context: z.string(
            'The context of the service to retrieve the OpenAPI/Swagger documentation for',
          ),
        }),
      },
    );
  }, [serviceDiscovery, llm]);
};
