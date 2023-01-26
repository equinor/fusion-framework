import { AuthToken } from '@equinor/fusion';
import AuthUser, { AuthUserJSON } from '@equinor/fusion/lib/auth/AuthUser';

// from msal
type AccountInfo = {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    localAccountId: string;
    name?: string;
};

/**
 * THIS IS ONLY TEMPORARY!!!
 * in future this should be deleted, when all apps are over on new framework!
 */
export class LegacyAuthUser {
    constructor(protected _info: AccountInfo) {}

    cast(): AuthUser {
        return this as unknown as AuthUser;
    }

    get id(): string {
        return this._info.localAccountId;
    }
    get fullName(): string {
        if (!this._info.name) {
            console.warn('[FusionAuthUser::fullName]: missing!');
            return '';
        }
        return this._info.name;
    }
    get givenName(): string {
        return this.fullName.split(' ').at(0) || '';
    }
    get familyName(): string {
        return this.fullName.split(' ').at(-1) || '';
    }

    /** @deprecated */
    get roles(): string[] {
        console.trace('FusionAuthUser::roles deprecation warning');
        return [];
    }
    get upn(): string {
        return this._info.username;
    }

    /** === DEPRECATED! === */
    mergeWithToken(_token: AuthToken): void {
        console.debug('FusionAuthUser::mergeWithToken', 'noop');
        // throw new Error("Method not implemented.");
    }
    toObject(): AuthUserJSON {
        console.debug('FusionAuthUser::toObject', 'legacy');
        return {
            id: this.id,
            familyName: this.familyName,
            fullName: this.fullName,
            givenName: this.givenName,
            roles: this.roles,
            upn: this.upn,
        };
    }

    toString(): string {
        console.debug('FusionAuthUser::toObject', 'legacy');
        return JSON.stringify(this.toObject());
    }
}
