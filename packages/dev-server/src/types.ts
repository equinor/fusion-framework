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

/**
 * Configuration options for the development server.
 *
 * @template TEnv - The type of the environment variables, extending Partial<FusionTemplateEnv>.
 *
 * @property spa - Optional Single Page Application (SPA) specific options.
 * @property spa.templateEnv - The template environment configuration or a function returning it.
 *
 * @property api - API proxy configuration options.
 * @property api.serviceDiscoveryUrl - The URL of the service discovery proxy endpoint.
 * @property api.processServices - Optional route mapper for processing service discovery data.
 * @property api.routes - Optional additional routes for the API service proxy, used for overriding proxy responses and mocking services.
 *
 * @property log - Optional logging configuration.
 * @property log.level - Optional log level.
 * @property log.logger - Optional custom logger implementing the ConsoleLogger interface.
 */
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
       * @remarks used for overriding proxy responses and mocking services.
       */
      routes?: ApiRoute[];
    };
    log?: {
      level?: number;
      logger?: ConsoleLogger;
    };
  };
