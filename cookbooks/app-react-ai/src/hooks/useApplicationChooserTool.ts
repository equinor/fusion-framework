import { useMemo } from 'react';
import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import { tool } from '@langchain/core/tools';
import z from 'zod';
import type { AIModule } from '@equinor/fusion-framework-module-ai';
import type { DynamicStructuredTool } from '@langchain/core/tools';
import { useAppModule } from '@equinor/fusion-framework-react-app';

export const useApplicationChooserTool = (): DynamicStructuredTool => {
  const modules = useFramework<[AIModule]>().modules;
  const aiModule = useAppModule<AIModule>('ai');

  return useMemo(() => {
    return tool(
      async (args: { query?: string; category?: string; tags?: string[] }) => {
        try {
          const llm = aiModule.getService('chat', 'non-reasoning');
          // Get all available applications from the app module
          const appClient = await modules.serviceDiscovery.createClient('apps');
          const allApps = await appClient.json<{value: any[]}>('/persons/me/apps');

          console.log(222, JSON.stringify(allApps, null, 2));

          // Transform AppManifest to our application info format
          const applications = allApps.value.map((app: any) => ({
            name: app.appKey,
            displayName: app.displayName,
            description: app.description || 'No description available',
            category: app.category?.displayName || 'Uncategorized',
            type: app.type,
            tags: [
              app.type,
              app.category?.name?.toLowerCase() || 'uncategorized',
              ...(app.category ? [app.category.displayName.toLowerCase()] : []),
            ].filter(Boolean),
          }));

          const result = await llm.invoke([
            {
              role: 'system',
              content: [
                'You are a helpful assistant that helps users find and choose the right Fusion Application for their needs.',
                'Search through all available Fusion applications by keywords, categories, or specific features.',
                'Returns detailed information about matching applications including descriptions, types, and categories.',
                'Useful for developers looking to discover available applications or find applications with specific functionality.',
              ].join('\n'),
            },
            {
              role: 'user',
              content: `Available applications: ${JSON.stringify(applications)} \n\n User query: ${args.query} \n\n User category: ${args.category} \n\n User tags: ${args.tags}`,
            },
          ]);
          return result.content;
        } catch (error) {
          console.error('Error fetching applications:', error);
          return JSON.stringify({
            error: 'Failed to fetch applications',
            message: 'Unable to retrieve application list from the Fusion Framework',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      {
        name: 'application_chooser',
        description: [
          'Helps users find and choose the right Fusion Application for their needs.',
          'Search through all available Fusion applications by keywords, categories, or specific features.',
          'Returns detailed information about matching applications including descriptions, types, and categories.',
          'Useful for developers looking to discover available applications or find applications with specific functionality.',
        ].join('\n'),
        schema: z.object({
          query: z
            .string()
            .optional()
            .describe(
              'Search query to find applications (searches app keys, display names, descriptions, types, and categories)',
            ),
          category: z
            .string()
            .optional()
            .describe('Filter by application category (e.g., "Data", "Analytics", "Tools")'),
          tags: z
            .array(z.string())
            .optional()
            .describe(
              'Filter by specific tags or technologies (e.g., ["react", "ai", "authentication"])',
            ),
        }),
      },
    );
  }, [modules, aiModule]);
};
