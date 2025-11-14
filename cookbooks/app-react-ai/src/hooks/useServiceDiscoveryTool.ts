import { useMemo } from "react";
import { useFramework } from "@equinor/fusion-framework-react-app/framework"
import { tool } from "@langchain/core/tools";
import z from "zod";


export const useServiceDiscoveryTool = () => {
    const serviceDiscovery = useFramework().modules.serviceDiscovery;
    return useMemo(() => {
        return tool(async () => {
            const services = await serviceDiscovery.resolveServices();
            return JSON.stringify(services);
            // const resolveUri = (service: { proxyTarget?: string, uri: string }) => service.proxyTarget ?? service.uri;
            // return services.map((service) => `name: ${service.name}, key: ${service.key}, uri: ${resolveUri(service)}, scopes: [${service.scopes?.join(',')}]`).join('\n');
        }, {
            name: 'service_discovery',
            description: 'List out all services available in the service discovery',
            schema: z.object({}),
        });
    }, [serviceDiscovery]);
};