export interface ISignalRConfigurator {
    config: SignalRConfig;
    createConfig: (config: SignalRConfig) => void;
}

export type SignalRConfig = {
    url: string;
    scopes: string[];
    baseUrl?: string;
    useFusionPortalClientBaseUrl?: boolean;
    timeout?: number;
}

export class SignalRConfigurator implements ISignalRConfigurator {
    config: SignalRConfig;
    constructor() {
        this.config = {
            url: '',
            baseUrl: '',
            scopes: [],
            useFusionPortalClientBaseUrl: false,
        };
    }

    createConfig(config: SignalRConfig) {
        this.config = config;
    }
}
