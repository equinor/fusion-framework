import type { ApiDataProcessor, ApiRoute } from '@equinor/fusion-framework-vite-plugin-api-service';
import type { FusionTemplateEnv, TemplateEnvFn } from '@equinor/fusion-framework-vite-plugin-spa';
import type { ConsoleLogger } from '@equinor/fusion-log';

export type FusionService = {
  key: string;
  uri: string;
  name: string;
};

export {
  FusionTemplateEnv as TemplateEnv,
  TemplateEnvFn,
} from '@equinor/fusion-framework-vite-plugin-spa';

export { UserConfig as DevServerOverrides } from 'vite';

export type DevServerOptions<TEnv extends Partial<FusionTemplateEnv> = Partial<FusionTemplateEnv>> =
  {
    spa?: {
      templateEnv: TEnv | TemplateEnvFn<TEnv>;
    };
    api: {
      /**
       * The URL of the service discovery proxy endpoint.
       */
      serviceDiscoveryUrl: string;

      /**
       * Route mapper for processing service discovery data.
       */
      processServices?: ApiDataProcessor<FusionService[]>;

      /**
       * Additional routes to be added to the API service proxy.
       * @note used for overriding proxy responses and mocking services.
       */
      routes?: ApiRoute[];
    };
    log?: {
      level?: number;
      logger?: ConsoleLogger;
    };
    server?: {
      port?: number;
      host?: string;
    };
  };
