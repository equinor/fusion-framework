export type Environment = {
    environmentName: string;
    clientId: string;
    resourceV2: string;
    resourceV1: string;
    type: string;
    services: Service[];
};

export type Service = {
    key: string;
    name: null | string;
    serviceName: null;
    uri: string;
    type: 'Service';
    internal: boolean;
};
