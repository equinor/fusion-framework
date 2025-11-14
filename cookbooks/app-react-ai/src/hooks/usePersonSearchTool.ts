import { useMemo } from 'react';
import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import { tool } from '@langchain/core/tools';
import z from 'zod';

export const usePersonSearchTool = () => {
  const modules = useFramework().modules;
  return useMemo(() => {
    return tool(
      async (args: { query: string; limit?: number }) => {
        const client = await modules.services.createPeopleClient();
        const results = await client.query('v2', 'json', { search: args.query, limit: args.limit });
        return JSON.stringify(results.map((person) => {
          return {
            name: person.name,
            mail: person.mail,
            azureId: person.azureUniqueId,
          };
        }));
      },
      {
        name: 'person_search',
        description: [
          'Searches for persons in the organization directory.',
          'Use this when users need to find people by name, email, job title, department, or other criteria.',
          'Returns a list of matching persons with their contact information and organizational details.',
          'Useful for finding colleagues, contacts, or organizational information.',
        ].join('\n'),
        schema: z.object({
          query: z
            .string()
            .describe('The search query to find persons (name, email, job title, department, etc.)'),
          limit: z
            .number()
            .optional()
            .default(25)
            .describe('Maximum number of results to return (default: 10)'),
        }),
      },
    );
  }, [modules]);
};
