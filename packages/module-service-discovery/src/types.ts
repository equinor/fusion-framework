export type EnvironmentResponse = {
    clientId: string;
    services: Array<{
        key: string;
        uri: string;
    }>;
};

export type Environment = {
    type?: string;
    services: Record<string, Service>;
};

export type Service = {
    name?: null | string;
    clientId?: string;
    uri: string;
    defaultScopes: string[];
};