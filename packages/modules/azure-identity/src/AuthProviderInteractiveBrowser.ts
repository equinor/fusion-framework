import {
  InteractiveBrowserCredential,
  type AuthenticationRecord,
  serializeAuthenticationRecord,
  deserializeAuthenticationRecord,
} from '@azure/identity';
import { PersistenceCreator, type IPersistence } from '@azure/msal-node-extensions';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { IAuthProvider } from './AuthProvider.interface.js';
import type { InteractiveAuthOptions } from './configurator.js';
import { NoCredentialError } from './errors.js';

/**
 * Authentication provider backed by Azure Identity's `InteractiveBrowserCredential`.
 *
 * Opens the user's default browser for Azure AD login using an authorization code
 * flow with a localhost redirect. Tokens are persisted to the OS keychain via
 * `cachePersistencePlugin` (registered at module load in `AuthProviderDefaultCredential`).
 *
 * The {@link AuthenticationRecord} is stored via `@azure/msal-node-extensions`
 * secure persistence (Keychain on macOS, DPAPI on Windows, libsecret on Linux)
 * so that subsequent CLI invocations can silently acquire tokens from the cache
 * without re-opening the browser.
 *
 * @example
 * ```typescript
 * const provider = await AuthProviderInteractiveBrowser.create({
 *   tenantId: '3aa4a235-...',
 *   clientId: 'a318b8e1-...',
 *   redirectPort: 49741,
 * });
 * const record = await provider.login({ request: { scopes: ['user.read'] } });
 * const token = await provider.acquireAccessToken({ request: { scopes: ['user.read'] } });
 * ```
 */
export class AuthProviderInteractiveBrowser implements IAuthProvider {
  readonly #credential: InteractiveBrowserCredential;
  readonly #authRecordPersistence: IPersistence;
  #authRecord: AuthenticationRecord | undefined;

  private constructor(
    options: InteractiveAuthOptions,
    authRecordPersistence: IPersistence,
    authenticationRecord?: AuthenticationRecord,
  ) {
    this.#authRecordPersistence = authRecordPersistence;
    this.#authRecord = authenticationRecord;
    this.#credential = new InteractiveBrowserCredential({
      tenantId: options.tenantId,
      clientId: options.clientId,
      redirectUri: `http://localhost:${options.redirectPort}`,
      tokenCachePersistenceOptions: { enabled: true },
      ...(options.onOpen
        ? {
            browserCustomizationOptions: {
              openBrowser: async (url: string) => {
                options.onOpen?.(url);
              },
            },
          }
        : {}),
      ...(authenticationRecord ? { authenticationRecord } : {}),
    });
  }

  /**
   * Creates an `AuthProviderInteractiveBrowser`, initialising OS-level secure
   * persistence and loading any previously stored {@link AuthenticationRecord}
   * so that silent token acquisition works across process restarts.
   *
   * @param options - Azure AD tenant, client, redirect port, and optional browser callback.
   * @returns A fully initialised provider with any persisted auth record pre-loaded.
   */
  static async create(options: InteractiveAuthOptions): Promise<AuthProviderInteractiveBrowser> {
    // OS-level secure storage: Keychain (macOS), DPAPI (Windows), libsecret (Linux)
    const persistence = await PersistenceCreator.createPersistence({
      cachePath: join(
        homedir(),
        '.fusion',
        `auth-record-${options.tenantId}_${options.clientId}.json`,
      ),
      serviceName: 'Fusion.CLI.AuthRecord',
      accountName: `${options.tenantId}_${options.clientId}`,
    });

    let record: AuthenticationRecord | undefined;
    try {
      const content = await persistence.load();
      if (content) {
        record = deserializeAuthenticationRecord(content);
      }
    } catch {
      // No persisted record — first run or cleared
    }

    return new AuthProviderInteractiveBrowser(options, persistence, record);
  }

  /**
   * Opens the system browser for Azure AD authentication and returns the
   * {@link AuthenticationRecord} on success.
   *
   * The record is saved to OS-level secure storage so subsequent process
   * invocations can silently acquire tokens without re-authenticating.
   *
   * @param options - Scopes to request.
   * @returns The authentication record from the interactive flow.
   * @throws {Error} When interactive authentication does not return a record.
   */
  async login(options: { request: { scopes: string[] } }): Promise<AuthenticationRecord> {
    const record = await this.#credential.authenticate(options.request.scopes);
    if (!record) {
      throw new Error('Interactive authentication did not return an authentication record.');
    }
    await this.#authRecordPersistence.save(serializeAuthenticationRecord(record));
    this.#authRecord = record;
    return record;
  }

  /**
   * Removes the persisted authentication record from secure storage.
   *
   * The OS-level token cache is not cleared programmatically. Run `az logout`
   * or clear your OS credential store for a full wipe.
   */
  async logout(): Promise<void> {
    await this.#authRecordPersistence.delete();
    this.#authRecord = undefined;
  }

  /**
   * Acquires an access token for the given scopes.
   *
   * If no {@link AuthenticationRecord} was loaded from persistence, performs a
   * one-time interactive authentication and saves the record so that all
   * subsequent calls (including from new processes) resolve silently.
   *
   * @param options - Scopes to request.
   * @returns The access token string.
   * @throws {Error} When the credential returns no token.
   */
  async acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> {
    // If no auth record exists yet, authenticate interactively once and persist
    // the record so future invocations can resolve tokens silently.
    if (!this.#authRecord) {
      const record = await this.#credential.authenticate(options.request.scopes);
      if (record) {
        await this.#authRecordPersistence.save(serializeAuthenticationRecord(record));
        this.#authRecord = record;
      }
    }

    const tokenResponse = await this.#credential.getToken(options.request.scopes);
    if (!tokenResponse) {
      throw new NoCredentialError(
        'InteractiveBrowserCredential returned no token. Ensure you have logged in first.',
      );
    }
    return tokenResponse.token;
  }
}
