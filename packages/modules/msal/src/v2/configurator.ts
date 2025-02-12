import z from 'zod';

import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import { MsalModuleVersion } from '../static';
import semver from 'semver';
import { IAuthProvider } from './provider';

const VersionSchema = z.string().transform((x: string) => String(semver.coerce(x)));

const AuthClientConfigSchema = z.object({
    clientId: z.string(),
    tenantId: z.string(),
    redirectUri: z.string().optional(),
});

// NOTE: this might need refinement to validate the provider
const AuthClientSchema = z.custom<IAuthProvider>();

const AuthConfigSchema = z
    .object({
        client: AuthClientConfigSchema.optional(),
        provider: AuthClientSchema.optional(),
        requiresAuth: z.boolean().optional(),
        version: VersionSchema.default(MsalModuleVersion.Latest),
    })
    .refine((data) => {
        if (!data.client && !data.provider) {
            throw new Error('Either client or provider must be defined');
        }
        return true;
    });

export type AuthClientConfig = z.infer<typeof AuthClientConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export class AuthConfigurator extends BaseConfigBuilder<AuthConfig> {
    public version = MsalModuleVersion.Latest as const;

    setClientConfig(config?: z.infer<typeof AuthClientConfigSchema>): void {
        this._set('client', async () => config);
    }

    setRequiresAuth(requiresAuth: boolean): void {
        this._set('requiresAuth', async () => requiresAuth);
    }

    setProvider(provider?: z.infer<typeof AuthClientSchema>): void {
        this._set('provider', async () => provider);
    }

    setVersion(version?: string): void {
        this._set('version', async () => version);
    }

    async _processConfig(config: AuthConfig): Promise<AuthConfig> {
        // TODO: handle parsing of clientConfig
        return AuthConfigSchema.parseAsync(config);
    }
}
