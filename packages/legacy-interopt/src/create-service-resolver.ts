import { PortalFramework } from './types';

export const createServiceResolver = async (
    provider: PortalFramework['modules']['serviceDiscovery']
) => {
    const { services } = await provider.resolveServices();
    return {
        getContextBaseUrl: () => services['context'].uri,
        getDataProxyBaseUrl: () => services['data-proxy'].uri,
        getFusionBaseUrl: () => services['portal'].uri,
        getMeetingsBaseUrl: () => services['meeting-v2'].uri,
        getOrgBaseUrl: () => services['org'].uri,
        getPowerBiBaseUrl: () => services['powerbi'].uri,
        getProjectsBaseUrl: () => services['projects'].uri,
        getTasksBaseUrl: () => services['tasks'].uri,
        getFusionTasksBaseUrl: () => services['tasks'].uri,
        getPeopleBaseUrl: () => services['people'].uri,
        getReportsBaseUrl: () => services['reports'].uri,
        // TODO - What?!?
        getPowerBiApiBaseUrl: () => 'https://api.powerbi.com/v1.0/myorg',
        getNotificationBaseUrl: () => services['notification'].uri,
        getInfoUrl: () => services['info'].uri,
        getBookmarksBaseUrl: () => services['bookmarks'].uri,
    };
};

export default createServiceResolver;
