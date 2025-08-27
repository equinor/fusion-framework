import type { Service } from '@equinor/fusion-framework-module-service-discovery';
import type LegacyAuthContainer from './LegacyAuthContainer';
import type { PortalFramework } from './types';

export const createServiceResolver = async (
  provider: PortalFramework['modules']['serviceDiscovery'],
  authContainer: LegacyAuthContainer,
  clientId: string = window.clientId,
) => {
  if (!clientId) {
    throw new Error('clientId is required');
  }
  const services = await provider.resolveServices().then((services: Service[]) =>
    services.reduce(
      (acc, service) => {
        // try to get the client id from the scope
        const scope = service.scopes?.[0];
        const id = scope ? (scope.split('/')[0] ?? clientId) : clientId;

        // assure that the clientMap has an array for the id
        if (!acc.clientMap[id]) {
          acc.clientMap[id] = [];
        }

        // add the service to the clientMap and serviceMap
        acc.clientMap[id]!.push(service);
        acc.serviceMap[service.key] = service;

        return acc;
      },
      {
        clientMap: {},
        serviceMap: {},
      } as {
        clientMap: Record<string, Service[]>;
        serviceMap: Record<string, Service>;
      },
    ),
  );

  /** register for legacy auth token */
  await Promise.all(
    Object.entries(services.clientMap).map(async ([id, uris]) => {
      return authContainer.registerAppAsync(
        id,
        (uris as Service[]).map((x: Service) => x.uri),
        true,
      );
    }),
  );

  return {
    getContextBaseUrl: () => services.serviceMap.context.uri,
    getDataProxyBaseUrl: () => services.serviceMap['data-proxy'].uri,
    getFusionBaseUrl: () => services.serviceMap.portal.uri,
    getMeetingsBaseUrl: () => services.serviceMap['meeting-v2'].uri,
    getOrgBaseUrl: () => services.serviceMap.org.uri,
    getPowerBiBaseUrl: () => services.serviceMap.powerbi.uri,
    getProjectsBaseUrl: () => services.serviceMap.projects.uri,
    getTasksBaseUrl: () => services.serviceMap.tasks.uri,
    getFusionTasksBaseUrl: () => services.serviceMap.tasks.uri,
    getPeopleBaseUrl: () => services.serviceMap.people.uri,
    getReportsBaseUrl: () => services.serviceMap.reports.uri,
    // TODO - What?!?
    getPowerBiApiBaseUrl: () => 'https://api.powerbi.com/v1.0/myorg',
    getNotificationBaseUrl: () => services.serviceMap.notification.uri,
    getInfoUrl: () => services.serviceMap.info.uri,
    getBookmarksBaseUrl: () => services.serviceMap.bookmarks.uri,
  };
};

export default createServiceResolver;
