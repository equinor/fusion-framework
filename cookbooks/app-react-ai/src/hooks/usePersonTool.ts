import { useMemo } from 'react';
import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import { tool } from '@langchain/core/tools';
import z from 'zod';

export const usePersonTool = () => {
  const modules = useFramework().modules;
  return useMemo(() => {
    return tool(
      async (args: { idOrEmail?: string }) => {
        const client = await modules.services.createPeopleClient(); //.serviceDiscovery.createClient('people');
        let person: any;
        if(args.idOrEmail) {
          person = await client.get('v4', 'json', { azureId: args.idOrEmail, expand: []});
        } else {
          person = await modules.serviceDiscovery.createClient('people').then(client => client.json('/persons/me?api-version=4.0'));
        }
        if(!person) {
          return 'Could not determine the current user';
        }
        return JSON.stringify({
          name: person.name,
          azureId: person.azureUniqueId,
          mail: person.mail,
          jobTitle: person.jobTitle,
          department: person.department,
          accountType: person.accountType,
          accountClassification: person.accountClassification,
          managerAzureUniqueId: person.manager?.azureUniqueId,
        });
      },
      {
        name: 'current_person',
        description:
          ['Retrieves detailed information about a person by their ID or email address. If no ID/email is provided, returns information about the currently authenticated user.',
            'Use this when users ask about person profiles, account details, contact information, or when you need to look up specific users.',
            'Returns person data including azureId and upn that can be used with fwc-person-card components.',
          ].join('\n'),
        schema: z.object({
          idOrEmail: z
            .string()
            .describe(
              'The ID or email of the person to retrieve. If not provided, the current user will be used.',
            ),
        }),
      },
    );
  }, [modules]);
};
