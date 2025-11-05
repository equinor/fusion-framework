/**
 * MSAL v2.38.4 compatible type definitions.
 *
 * This file contains all types required to type IPublicClientApplication
 * from MSAL v2.38.4 to maintain backward compatibility while using MSAL v4 implementation.
 */

// ============================================================================
// Basic Types
// ============================================================================

/**
 * Key-Value type to support queryParams, extraQueryParams and claims
 */
export type StringDict = { [key: string]: string };

/**
 * Response mode for authorization requests
 */
export type ResponseMode = 'query' | 'fragment' | 'form_post';

/**
 * Authentication scheme type
 */
export type AuthenticationScheme = 'Bearer' | 'pop' | 'ssh-cert';

/**
 * Azure Cloud Instance options
 */
export type AzureCloudInstance = 'none' | 'Public' | 'UsGov' | 'China' | 'Germany';

/**
 * Azure Cloud Options
 */
export type AzureCloudOptions = {
  azureCloudInstance: AzureCloudInstance;
  tenant?: string;
};

/**
 * Store in cache options
 */
export type StoreInCache = {
  /** Indicates whether or not the acquired accessToken will be stored in the cache */
  accessToken?: boolean;
  /** Indicates whether or not the acquired idToken will be stored in the cache */
  idToken?: boolean;
  /** Indicates whether or not the acquired refreshToken will be stored in the cache */
  refreshToken?: boolean;
};

/**
 * Signed HTTP Request options
 */
export type ShrOptions = {
  header: {
    typ?: string;
    alg?: string;
    kid?: string;
  };
};

// ============================================================================
// Account Types
// ============================================================================

/**
 * MSAL v2 compatible AccountInfo type.
 *
 * This type represents account information in MSAL v2 format
 * to maintain backward compatibility while using MSAL v4 implementation.
 */
export type AccountInfo = {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
  idToken?: string;
  idTokenClaims?: {
    [key: string]: string | number | string[] | object | undefined | unknown;
  };
  nativeAccountId?: string;
  authorityType?: string;
};

// ============================================================================
// Authentication Result Types
// ============================================================================

/**
 * MSAL v2 compatible AuthenticationResult type.
 *
 * This type represents authentication results in MSAL v2 format
 * to maintain backward compatibility while using MSAL v4 implementation.
 */
export type AuthenticationResult = {
  authority: string;
  uniqueId: string;
  tenantId: string;
  scopes: Array<string>;
  account: AccountInfo | null;
  idToken: string;
  idTokenClaims: object;
  accessToken: string;
  fromCache: boolean;
  expiresOn: Date | null;
  extExpiresOn?: Date;
  refreshOn?: Date;
  tokenType: string;
  correlationId: string;
  requestId?: string;
  state?: string;
  familyId?: string;
  cloudGraphHostName?: string;
  msGraphHost?: string;
  code?: string;
  fromNativeBroker?: boolean;
};

// ============================================================================
// Request Base Types
// ============================================================================

/**
 * Base authentication request type
 */
export type BaseAuthRequest = {
  authority: string;
  correlationId: string;
  scopes: Array<string>;
  authenticationScheme?: AuthenticationScheme;
  claims?: string;
  shrClaims?: string;
  shrNonce?: string;
  shrOptions?: ShrOptions;
  resourceRequestMethod?: string;
  resourceRequestUri?: string;
  sshJwk?: string;
  sshKid?: string;
  azureCloudOptions?: AzureCloudOptions;
  requestedClaimsHash?: string;
  maxAge?: number;
  tokenQueryParameters?: StringDict;
  storeInCache?: StoreInCache;
};

/**
 * Common authorization URL request type
 */
export type CommonAuthorizationUrlRequest = BaseAuthRequest & {
  redirectUri: string;
  responseMode: ResponseMode;
  account?: AccountInfo;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  domainHint?: string;
  extraQueryParameters?: StringDict;
  extraScopesToConsent?: Array<string>;
  loginHint?: string;
  nonce?: string;
  prompt?: string;
  sid?: string;
  state?: string;
  nativeBroker?: boolean;
};

/**
 * Common silent flow request type
 */
export type CommonSilentFlowRequest = BaseAuthRequest & {
  /** Account object to lookup the credentials */
  account: AccountInfo;
  /** Skip cache lookup and forces network call(s) to get fresh tokens */
  forceRefresh: boolean;
  /** RedirectUri registered on the app registration - only required in brokering scenarios */
  redirectUri?: string;
  /** Key value pairs to include on the POST body to the /token endpoint */
  tokenBodyParameters?: StringDict;
  /** If refresh token will expire within the configured value, consider it already expired. Used to pre-emptively invoke interaction when cached refresh token is close to expiry. */
  refreshTokenExpirationOffsetSeconds?: number;
};

/**
 * Common end session request type
 */
export type CommonEndSessionRequest = {
  correlationId: string;
  account?: AccountInfo | null;
  postLogoutRedirectUri?: string | null;
  idTokenHint?: string;
  state?: string;
  logoutHint?: string;
  extraQueryParameters?: StringDict;
};

/**
 * Common authorization code request type
 */
export type CommonAuthorizationCodeRequest = BaseAuthRequest & {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
  tokenBodyParameters?: StringDict;
  enableSpaAuthorizationCode?: boolean;
  clientInfo?: string;
};

// ============================================================================
// Popup Window Types
// ============================================================================

/**
 * Popup window size configuration
 */
export type PopupSize = {
  height: number;
  width: number;
};

/**
 * Popup window position configuration
 */
export type PopupPosition = {
  top: number;
  left: number;
};

/**
 * Popup configurations for setting dimensions and position of popup window
 */
export type PopupWindowAttributes = {
  popupSize?: PopupSize;
  popupPosition?: PopupPosition;
};

// ============================================================================
// Request Types
// ============================================================================

/**
 * Cache lookup policy for silent token requests
 */
export type CacheLookupPolicy =
  | 0 // Default
  | 1 // AccessToken
  | 2 // AccessTokenAndRefreshToken
  | 3 // RefreshToken
  | 4 // RefreshTokenAndNetwork
  | 5; // Skip

/**
 * PopupRequest: Request object passed by user to retrieve a Code from the
 * server (first leg of authorization code grant flow) with a popup window.
 */
export type PopupRequest = Partial<
  Omit<
    CommonAuthorizationUrlRequest,
    | 'responseMode'
    | 'scopes'
    | 'codeChallenge'
    | 'codeChallengeMethod'
    | 'requestedClaimsHash'
    | 'nativeBroker'
  >
> & {
  scopes: Array<string>;
  popupWindowAttributes?: PopupWindowAttributes;
  tokenBodyParameters?: StringDict;
};

/**
 * RedirectRequest: Request object passed by user to retrieve a Code from the
 * server (first leg of authorization code grant flow) with a full page redirect.
 */
export type RedirectRequest = Partial<
  Omit<
    CommonAuthorizationUrlRequest,
    | 'responseMode'
    | 'scopes'
    | 'codeChallenge'
    | 'codeChallengeMethod'
    | 'requestedClaimsHash'
    | 'nativeBroker'
  >
> & {
  scopes: Array<string>;
  redirectStartPage?: string;
  onRedirectNavigate?: (url: string) => boolean | void;
  tokenBodyParameters?: StringDict;
};

/**
 * SilentRequest: Request object passed by user to retrieve tokens from the
 * cache, renew an expired token with a refresh token, or retrieve a code (first leg of authorization code grant flow)
 * in a hidden iframe.
 */
export type SilentRequest = Omit<
  CommonSilentFlowRequest,
  'authority' | 'correlationId' | 'forceRefresh' | 'account' | 'requestedClaimsHash'
> & {
  redirectUri?: string;
  extraQueryParameters?: StringDict;
  authority?: string;
  account?: AccountInfo;
  correlationId?: string;
  forceRefresh?: boolean;
  cacheLookupPolicy?: CacheLookupPolicy;
  prompt?: string;
  state?: string;
  tokenBodyParameters?: StringDict;
};

/**
 * SsoSilentRequest: Request object passed by user to ssoSilent to retrieve a Code from the server
 * (first leg of authorization code grant flow)
 */
export type SsoSilentRequest = Partial<
  Omit<
    CommonAuthorizationUrlRequest,
    | 'responseMode'
    | 'codeChallenge'
    | 'codeChallengeMethod'
    | 'requestedClaimsHash'
    | 'nativeBroker'
  >
> & {
  tokenBodyParameters?: StringDict;
};

/**
 * EndSessionRequest: Request object for logging out
 */
export type EndSessionRequest = Partial<Omit<CommonEndSessionRequest, 'tokenQueryParameters'>> & {
  authority?: string;
  onRedirectNavigate?: (url: string) => boolean | void;
};

/**
 * EndSessionPopupRequest: Request object for logging out via popup
 */
export type EndSessionPopupRequest = Partial<
  Omit<CommonEndSessionRequest, 'tokenQueryParameters'>
> & {
  authority?: string;
  mainWindowRedirectUri?: string;
  popupWindowAttributes?: PopupWindowAttributes;
};

/**
 * AuthorizationCodeRequest: Request object for acquiring token by code
 */
export type AuthorizationCodeRequest = Partial<
  Omit<
    CommonAuthorizationCodeRequest,
    'code' | 'enableSpaAuthorizationCode' | 'requestedClaimsHash'
  >
> & {
  code?: string;
  nativeAccountId?: string;
  cloudGraphHostName?: string;
  msGraphHost?: string;
  cloudInstanceHostName?: string;
};

/**
 * ClearCacheRequest: Request object for clearing cache
 */
export type ClearCacheRequest = {
  correlationId?: string;
  account?: AccountInfo | null;
};

// ============================================================================
// Logger Types
// ============================================================================

/**
 * Log message level
 */
export enum LogLevel {
  Error = 0,
  Warning = 1,
  Info = 2,
  Verbose = 3,
  Trace = 4,
}

/**
 * Callback to send the messages to
 */
export interface ILoggerCallback {
  (level: LogLevel, message: string, containsPii: boolean): void;
}

/**
 * Options for logger messages
 */
export type LoggerOptions = {
  loggerCallback?: ILoggerCallback;
  piiLoggingEnabled?: boolean;
  logLevel?: LogLevel;
  correlationId?: string;
};

/**
 * Class which facilitates logging of messages to a specific place
 */
export class Logger {
  // Correlation ID for request, usually set by user.
  private correlationId: string;

  // Current log level, defaults to info.
  private level: LogLevel = LogLevel.Info;

  // Boolean describing whether PII logging is allowed.
  private piiLoggingEnabled: boolean;

  // Callback to send messages to.
  private localCallback: ILoggerCallback;

  // Package name implementing this logger
  private packageName: string;

  // Package version implementing this logger
  private packageVersion: string;

  constructor(loggerOptions: LoggerOptions, packageName?: string, packageVersion?: string) {
    const defaultLoggerCallback = () => {
      return;
    };
    const setLoggerOptions = loggerOptions || Logger.createDefaultLoggerOptions();
    this.localCallback = setLoggerOptions.loggerCallback || defaultLoggerCallback;
    this.piiLoggingEnabled = setLoggerOptions.piiLoggingEnabled || false;
    this.level =
      typeof setLoggerOptions.logLevel === 'number' ? setLoggerOptions.logLevel : LogLevel.Info;
    this.correlationId = setLoggerOptions.correlationId || '';
    this.packageName = packageName || '';
    this.packageVersion = packageVersion || '';
  }

  private static createDefaultLoggerOptions(): LoggerOptions {
    return {
      loggerCallback: () => {
        // allow users to not set loggerCallback
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    };
  }

  /**
   * Create new Logger with existing configurations.
   */
  public clone(packageName: string, packageVersion: string, correlationId?: string): Logger {
    return new Logger(
      {
        loggerCallback: this.localCallback,
        piiLoggingEnabled: this.piiLoggingEnabled,
        logLevel: this.level,
        correlationId: correlationId || this.correlationId,
      },
      packageName,
      packageVersion,
    );
  }

  /**
   * Logs error messages.
   */
  error(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Error,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs warning messages.
   */
  warning(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Warning,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs info messages.
   */
  info(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Info,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs verbose messages.
   */
  verbose(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Verbose,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs trace messages.
   */
  trace(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Trace,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Returns whether PII Logging is enabled or not.
   */
  isPiiLoggingEnabled(): boolean {
    return this.piiLoggingEnabled || false;
  }

  private logMessage(
    logMessage: string,
    options: {
      logLevel: LogLevel;
      containsPii: boolean;
      correlationId: string;
    },
  ): void {
    if (options.logLevel > this.level || (!this.piiLoggingEnabled && options.containsPii)) {
      return;
    }
    const timestamp = new Date().toUTCString();

    // Add correlationId to logs if set, correlationId provided on log messages take precedence
    const logHeader = `[${timestamp}] : [${options.correlationId || this.correlationId || ''}]`;

    const log = `${logHeader} : ${this.packageName}@${
      this.packageVersion
    } : ${LogLevel[options.logLevel]} - ${logMessage}`;
    this.executeCallback(options.logLevel, log, options.containsPii || false);
  }

  /**
   * Execute callback with message.
   */
  executeCallback(level: LogLevel, message: string, containsPii: boolean): void {
    if (this.localCallback) {
      this.localCallback(level, message, containsPii);
    }
  }
}

// ============================================================================
// Performance Types
// ============================================================================

/**
 * Performance event type
 */
export type PerformanceEvent = {
  eventId?: string;
  eventName: string;
  correlationId?: string;
  durationMs?: number;
  startTimeMs?: number;
  endTimeMs?: number;
  [key: string]: unknown;
};

/**
 * Performance callback function type
 */
export type PerformanceCallbackFunction = (events: PerformanceEvent[]) => void;

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event callback function type
 */
export type EventCallbackFunction = (message: EventMessage) => void;

/**
 * Event message type
 */
export type EventMessage = {
  eventType: string;
  interactionType: string | null;
  payload: unknown;
  error: unknown;
  timestamp: number;
};

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * API ID for telemetry
 */
export type ApiId =
  | 861 // acquireTokenRedirect
  | 862 // acquireTokenPopup
  | 863 // ssoSilent
  | 864 // acquireTokenSilent_authCode
  | 865 // handleRedirectPromise
  | 866 // acquireTokenByCode
  | 61 // acquireTokenSilent_silentFlow
  | 961 // logout
  | 962; // logoutPopup

/**
 * Navigation options for navigation client
 */
export type NavigationOptions = {
  /** The Id of the API that initiated navigation */
  apiId: ApiId;
  /** Suggested timeout (ms) based on the configuration provided to PublicClientApplication */
  timeout: number;
  /** When set to true the url should not be added to the browser history */
  noHistory: boolean;
};

/**
 * Navigation client interface
 */
export interface INavigationClient {
  /**
   * Navigates to other pages within the same web application
   * Return false if this doesn't cause the page to reload i.e. Client-side navigation
   */
  navigateInternal(url: string, options: NavigationOptions): Promise<boolean>;

  /**
   * Navigates to other pages outside the web application i.e. the Identity Provider
   */
  navigateExternal(url: string, options: NavigationOptions): Promise<boolean>;
}

// ============================================================================
// Token Cache Types
// ============================================================================

/**
 * Token cache interface
 */
export interface ITokenCache {
  /**
   * API to side-load tokens to MSAL cache
   * @returns `AuthenticationResult` for the response that was loaded.
   */
  loadExternalTokens(
    request: SilentRequest,
    response: ExternalTokenResponse,
    options: LoadTokenOptions,
  ): AuthenticationResult;
}

/**
 * External token response type
 */
export type ExternalTokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  client_info?: string;
  [key: string]: unknown;
};

/**
 * Load token options
 */
export type LoadTokenOptions = {
  clientInfo?: string;
  expiresOn?: number;
  extendedExpiresOn?: number;
};

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Wrapper SKU type
 */
export type WrapperSKU = '@azure/msal-react' | '@azure/msal-angular';

/**
 * Browser cache location
 */
export type BrowserCacheLocation = 'localStorage' | 'sessionStorage' | 'memoryStorage';

/**
 * Browser auth options
 */
export type BrowserAuthOptions = {
  clientId: string;
  authority?: string;
  knownAuthorities?: Array<string>;
  cloudDiscoveryMetadata?: string;
  authorityMetadata?: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string | null;
  navigateToLoginRequestUrl?: boolean;
  clientCapabilities?: Array<string>;
  protocolMode?: string;
  OIDCOptions?: {
    serverResponseType?: 'query' | 'fragment';
    defaultScopes?: Array<string>;
  };
  azureCloudOptions?: AzureCloudOptions;
  skipAuthorityMetadataCache?: boolean;
  supportsNestedAppAuth?: boolean;
};

/**
 * Cache options
 */
export type CacheOptions = {
  cacheLocation?: BrowserCacheLocation | string;
  temporaryCacheLocation?: BrowserCacheLocation | string;
  storeAuthStateInCookie?: boolean;
  secureCookies?: boolean;
  cacheMigrationEnabled?: boolean;
  claimsBasedCachingEnabled?: boolean;
};

/**
 * Browser system options
 */
export type BrowserSystemOptions = {
  loggerOptions?: LoggerOptions;
  networkClient?: unknown;
  navigationClient?: INavigationClient;
  windowHashTimeout?: number;
  iframeHashTimeout?: number;
  loadFrameTimeout?: number;
  navigateFrameWait?: number;
  redirectNavigationTimeout?: number;
  asyncPopups?: boolean;
  allowRedirectInIframe?: boolean;
  allowNativeBroker?: boolean;
  nativeBrokerHandshakeTimeout?: number;
  pollIntervalMilliseconds?: number;
};

/**
 * Browser telemetry options
 */
export type BrowserTelemetryOptions = {
  application?: {
    appName: string;
    appVersion: string;
  };
  client?: unknown;
};

/**
 * Browser configuration type
 */
export type BrowserConfiguration = {
  auth: Required<BrowserAuthOptions>;
  cache: Required<CacheOptions>;
  system: Required<BrowserSystemOptions>;
  telemetry: Required<BrowserTelemetryOptions>;
};

// ============================================================================
// IPublicClientApplication Interface
// ============================================================================

/**
 * IPublicClientApplication interface from MSAL v2.38.4
 */
export interface IPublicClientApplication {
  initialize(): Promise<void>;
  acquireTokenPopup(request: PopupRequest): Promise<AuthenticationResult>;
  acquireTokenRedirect(request: RedirectRequest): Promise<void>;
  acquireTokenSilent(silentRequest: SilentRequest): Promise<AuthenticationResult>;
  acquireTokenByCode(request: AuthorizationCodeRequest): Promise<AuthenticationResult>;
  addEventCallback(callback: EventCallbackFunction): string | null;
  removeEventCallback(callbackId: string): void;
  addPerformanceCallback(callback: PerformanceCallbackFunction): string;
  removePerformanceCallback(callbackId: string): boolean;
  enableAccountStorageEvents(): void;
  disableAccountStorageEvents(): void;
  getAccountByHomeId(homeAccountId: string): AccountInfo | null;
  getAccountByLocalId(localId: string): AccountInfo | null;
  getAccountByUsername(userName: string): AccountInfo | null;
  getAllAccounts(): AccountInfo[];
  handleRedirectPromise(hash?: string): Promise<AuthenticationResult | null>;
  loginPopup(request?: PopupRequest): Promise<AuthenticationResult>;
  loginRedirect(request?: RedirectRequest): Promise<void>;
  logout(logoutRequest?: EndSessionRequest): Promise<void>;
  logoutRedirect(logoutRequest?: EndSessionRequest): Promise<void>;
  logoutPopup(logoutRequest?: EndSessionPopupRequest): Promise<void>;
  ssoSilent(request: SsoSilentRequest): Promise<AuthenticationResult>;
  getTokenCache(): ITokenCache;
  getLogger(): Logger;
  setLogger(logger: Logger): void;
  setActiveAccount(account: AccountInfo | null): void;
  getActiveAccount(): AccountInfo | null;
  initializeWrapperLibrary(sku: WrapperSKU, version: string): void;
  setNavigationClient(navigationClient: INavigationClient): void;
  /** @internal */
  getConfiguration(): BrowserConfiguration;
  hydrateCache(
    result: AuthenticationResult,
    request: SilentRequest | SsoSilentRequest | RedirectRequest | PopupRequest,
  ): Promise<void>;
  clearCache(logoutRequest?: ClearCacheRequest): Promise<void>;
}
