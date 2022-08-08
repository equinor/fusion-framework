import type { ObservableInput } from 'rxjs';

// TODO - @odinr - talk to Fusion Backend team about fixing service
export type Endpoint = { name: string; uri: string; scopes?: string[] };

export type AppConfig<TEnvironment> = {
    environment: TEnvironment;
    endpoints: Record<string, string | Endpoint>;
};

/**
 * Client for executing app config requests
 */
export type AppConfigClient<TEnvironment = unknown> = (
    appKey: string,
    tag?: string
) => ObservableInput<AppConfig<TEnvironment>>;

/**
 * Http selector of response
 */
export type AppConfigSelector<TEnvironment = unknown> = (
    result: Response
) => Promise<AppConfig<TEnvironment>>;
