import type { ConfigEnv } from 'vite';

export type TemplateEnv = Record<string, unknown>;

export type ResourceConfiguration = {
  url: string;
  scopes?: string[];
  rewrite?: string;
};

/**
 * Represents the environment configuration for a template.
 */
export type FusionTemplateEnv = {
  /** Document title */
  title: string;
  /** Template bootstrap file path */
  bootstrap: string;

  /** Id of the portal to load */
  portal: {
    id: string;
    tag?: string;
  };

  /** Service discovery configuration */
  serviceDiscovery: {
    url: string;
    scopes: string[];
  };

  /** MSAL configuration */
  msal: {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    requiresAuth: string;
  };
  /** Service worker configuration */
  serviceWorker: {
    resources: ResourceConfiguration[];
  };
};

/**
 * A function type that generates a partial environment configuration for a template.
 *
 * @template TEnv - The type of the environment configuration. Defaults to `TemplateEnv`.
 * @param configEnv - The configuration environment provided as input.
 * @returns A partial environment configuration of type `TEnv`, or `undefined` if no configuration is provided.
 */
export type TemplateEnvFn<TEnv extends TemplateEnv> = (
  configEnv: ConfigEnv,
) => Partial<TEnv> | undefined;
