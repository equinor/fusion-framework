/**
 * MSAL v4/v5 compatible type definitions.
 *
 * @remarks
 * This file contains explicit type snapshots from MSAL v5 (browser 5.0.2, common 15.14.1)
 * to provide a stable v4 compatibility layer. These types are frozen snapshots to prevent
 * breaking changes from future MSAL versions automatically propagating to v4 consumers.
 *
 * Since MSAL v4 and v5 are API compatible, these types directly match the v5 API surface.
 *
 * @module v4/types
 */

// ============================================================================
// Framework Types
// ============================================================================

export type {
	IMsalClient,
	AcquireTokenResult,
	LoginOptions,
	LogoutOptions,
	LoginResult,
	AcquireTokenOptions,
	AuthBehavior,
} from '../MsalClient.interface';

export type { IMsalProvider } from '../MsalProvider.interface';
export type { IProxyProvider } from '../MsalProxyProvider.interface';

// ============================================================================
// Basic Types
// ============================================================================

/**
 * Key-Value type to support queryParams, extraQueryParameters and claims
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
 * Data boundary type for account
 */
export type DataBoundary = 'EU' | 'None';

/**
 * Azure Cloud Instance options
 */
export type AzureCloudInstance =
	| 0 // None
	| 1 // AzurePublic
	| 2 // AzurePPE
	| 3 // AzureChina
	| 4 // AzureGermany
	| 5; // AzureUsGovernment

/**
 * Azure Cloud Options
 */
export type AzureCloudOptions = {
	azureCloudInstance: AzureCloudInstance;
	tenant?: string;
};

// ============================================================================
// Token Claims Types
// ============================================================================

/**
 * Type which describes Id Token claims known by MSAL.
 */
export type TokenClaims = {
	/** Audience */
	aud?: string;
	/** Issuer */
	iss?: string;
	/** Issued at */
	iat?: number;
	/** Not valid before */
	nbf?: number;
	/** Immutable object identifier, this ID uniquely identifies the user across applications */
	oid?: string;
	/** Immutable subject identifier, this is a pairwise identifier - it is unique to a particular application ID */
	sub?: string;
	/** Users' tenant or '9188040d-6c67-4c5b-b112-36a304b66dad' for personal accounts. */
	tid?: string;
	/** Trusted Framework Policy (B2C) The name of the policy that was used to acquire the ID token. */
	tfp?: string;
	/** Authentication Context Class Reference (B2C) Used only with older policies. */
	acr?: string;
	ver?: string;
	upn?: string;
	preferred_username?: string;
	login_hint?: string;
	/** Contains KMSI (Keep Me Signed In) status among other things */
	signin_state?: Array<string>;
	emails?: string[];
	name?: string;
	nonce?: string;
	/** Expiration */
	exp?: number;
	home_oid?: string;
	sid?: string;
	cloud_instance_host_name?: string;
	cnf?: {
		kid: string;
	};
	x5c_ca?: string[];
	ts?: number;
	at?: string;
	u?: string;
	p?: string;
	m?: string;
	roles?: string[];
	amr?: string[];
	idp?: string;
	auth_time?: number;
	/** Region of the resource tenant */
	tenant_region_scope?: string;
	tenant_region_sub_scope?: string;
};

// ============================================================================
// Account Types
// ============================================================================

/**
 * Account details that vary across tenants for the same user
 */
export type TenantProfile = {
	tenantId: string;
	localAccountId: string;
	name?: string;
	username: string;
	loginHint?: string;
	/** True if this is the home tenant profile of the account, false if it's a guest tenant profile */
	isHomeTenant?: boolean;
};

/**
 * MSAL v5 AccountInfo type.
 *
 * Account object with the following signature:
 * - homeAccountId          - Home account identifier for this account object
 * - environment            - Entity which issued the token represented by the domain of the issuer (e.g. login.microsoftonline.com)
 * - tenantId               - Full tenant or organizational id that this account belongs to
 * - username               - preferred_username claim of the id_token that represents this account
 * - localAccountId         - Local, tenant-specific account identifer for this account object, usually used in legacy cases
 * - name                   - Full name for the account, including given name and family name
 * - idToken                - raw ID token
 * - idTokenClaims          - Object contains claims from ID token
 * - nativeAccountId        - The user's native account ID
 * - tenantProfiles         - Map of tenant profile objects for each tenant that the account has authenticated with in the browser
 * - dataBoundary           - Data boundary extracted from clientInfo
 */
export type AccountInfo = {
	homeAccountId: string;
	environment: string;
	tenantId: string;
	username: string;
	localAccountId: string;
	loginHint?: string;
	name?: string;
	idToken?: string;
	idTokenClaims?: TokenClaims & {
		[key: string]: string | number | string[] | object | undefined | unknown;
	};
	nativeAccountId?: string;
	authorityType?: string;
	tenantProfiles?: Map<string, TenantProfile>;
	dataBoundary?: DataBoundary;
};

// ============================================================================
// Authentication Result Types
// ============================================================================

/**
 * MSAL v5 AuthenticationResult type.
 *
 * Result returned from the authority's token endpoint.
 * - uniqueId               - `oid` or `sub` claim from ID token
 * - tenantId               - `tid` claim from ID token
 * - scopes                 - Scopes that are validated for the respective token
 * - account                - An account object representation of the currently signed-in user
 * - idToken                - Id token received as part of the response
 * - idTokenClaims          - MSAL-relevant ID token claims
 * - accessToken            - Access token or SSH certificate received as part of the response
 * - fromCache              - Boolean denoting whether token came from cache
 * - expiresOn              - Javascript Date object representing relative expiration of access token
 * - extExpiresOn           - Javascript Date object representing extended relative expiration of access token in case of server outage
 * - refreshOn              - Javascript Date object representing relative time until an access token must be refreshed
 * - state                  - Value passed in by user in request
 * - familyId               - Family ID identifier, usually only used for refresh tokens
 * - requestId              - Request ID returned as part of the response
 */
export type AuthenticationResult = {
	authority: string;
	uniqueId: string;
	tenantId: string;
	scopes: Array<string>;
	account: AccountInfo;
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

/**
 * PopupRequest: Request object passed by user to retrieve a Code from the
 * server (first leg of authorization code grant flow) with a popup window.
 */
export type PopupRequest = {
	scopes: Array<string>;
	authority?: string;
	correlationId?: string;
	redirectUri?: string;
	extraScopesToConsent?: Array<string>;
	state?: string;
	prompt?: string;
	loginHint?: string;
	domainHint?: string;
	claims?: string;
	nonce?: string;
	extraQueryParameters?: StringDict;
	tokenQueryParameters?: StringDict;
	sid?: string;
	account?: AccountInfo;
	popupWindowAttributes?: PopupWindowAttributes;
	authenticationScheme?: AuthenticationScheme;
	resourceRequestMethod?: string;
	resourceRequestUri?: string;
	shrClaims?: string;
	shrNonce?: string;
	azureCloudOptions?: AzureCloudOptions;
	maxAge?: number;
};

/**
 * RedirectRequest: Request object passed by user to retrieve a Code from the
 * server (first leg of authorization code grant flow) with a full page redirect.
 */
export type RedirectRequest = {
	scopes: Array<string>;
	authority?: string;
	correlationId?: string;
	redirectUri?: string;
	extraScopesToConsent?: Array<string>;
	state?: string;
	prompt?: string;
	loginHint?: string;
	domainHint?: string;
	claims?: string;
	nonce?: string;
	extraQueryParameters?: StringDict;
	tokenQueryParameters?: StringDict;
	sid?: string;
	account?: AccountInfo;
	redirectStartPage?: string;
	onRedirectNavigate?: (url: string) => boolean | void;
	authenticationScheme?: AuthenticationScheme;
	resourceRequestMethod?: string;
	resourceRequestUri?: string;
	shrClaims?: string;
	shrNonce?: string;
	azureCloudOptions?: AzureCloudOptions;
	maxAge?: number;
};

/**
 * SilentRequest: Request object passed by user to retrieve tokens from the
 * cache, renew an expired token with a refresh token, or retrieve a code (first leg of authorization code grant flow)
 * in a hidden iframe.
 */
export type SilentRequest = {
	scopes: Array<string>;
	account: AccountInfo;
	authority?: string;
	correlationId?: string;
	forceRefresh?: boolean;
	redirectUri?: string;
	extraQueryParameters?: StringDict;
	tokenQueryParameters?: StringDict;
	claims?: string;
	cacheLookupPolicy?: CacheLookupPolicy;
	authenticationScheme?: AuthenticationScheme;
	resourceRequestMethod?: string;
	resourceRequestUri?: string;
	shrClaims?: string;
	shrNonce?: string;
	azureCloudOptions?: AzureCloudOptions;
	maxAge?: number;
};

/**
 * SsoSilentRequest: Request object passed by user to ssoSilent to retrieve a Code from the server
 * (first leg of authorization code grant flow)
 */
export type SsoSilentRequest = {
	scopes?: Array<string>;
	authority?: string;
	correlationId?: string;
	redirectUri?: string;
	extraScopesToConsent?: Array<string>;
	state?: string;
	prompt?: string;
	loginHint?: string;
	domainHint?: string;
	claims?: string;
	nonce?: string;
	extraQueryParameters?: StringDict;
	tokenQueryParameters?: StringDict;
	sid?: string;
	account?: AccountInfo;
	authenticationScheme?: AuthenticationScheme;
	resourceRequestMethod?: string;
	resourceRequestUri?: string;
	shrClaims?: string;
	shrNonce?: string;
	azureCloudOptions?: AzureCloudOptions;
	maxAge?: number;
};

/**
 * EndSessionRequest: Request object for logging out
 */
export type EndSessionRequest = {
	account?: AccountInfo | null;
	postLogoutRedirectUri?: string | null;
	authority?: string;
	correlationId?: string;
	idTokenHint?: string;
	state?: string;
	logoutHint?: string;
	extraQueryParameters?: StringDict;
	onRedirectNavigate?: (url: string) => boolean | void;
};

/**
 * EndSessionPopupRequest: Request object for logging out via popup
 */
export type EndSessionPopupRequest = {
	account?: AccountInfo | null;
	postLogoutRedirectUri?: string | null;
	authority?: string;
	correlationId?: string;
	idTokenHint?: string;
	state?: string;
	logoutHint?: string;
	extraQueryParameters?: StringDict;
	mainWindowRedirectUri?: string;
	popupWindowAttributes?: PopupWindowAttributes;
};

/**
 * AuthorizationCodeRequest: Request object for acquiring token by code
 */
export type AuthorizationCodeRequest = {
	code?: string;
	scopes?: Array<string>;
	authority?: string;
	correlationId?: string;
	redirectUri?: string;
	claims?: string;
	authenticationScheme?: AuthenticationScheme;
	resourceRequestMethod?: string;
	resourceRequestUri?: string;
	shrClaims?: string;
	shrNonce?: string;
	azureCloudOptions?: AzureCloudOptions;
	maxAge?: number;
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

/**
 * InitializeApplicationRequest: Request object for initializing the application
 */
export type InitializeApplicationRequest = {
	correlationId?: string;
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

/**
 * Event type enum
 */
export type EventType =
	| 'LOGIN_START'
	| 'LOGIN_SUCCESS'
	| 'LOGIN_FAILURE'
	| 'ACQUIRE_TOKEN_START'
	| 'ACQUIRE_TOKEN_SUCCESS'
	| 'ACQUIRE_TOKEN_FAILURE'
	| 'ACQUIRE_TOKEN_NETWORK_START'
	| 'SSO_SILENT_START'
	| 'SSO_SILENT_SUCCESS'
	| 'SSO_SILENT_FAILURE'
	| 'HANDLE_REDIRECT_START'
	| 'HANDLE_REDIRECT_END'
	| 'LOGOUT_START'
	| 'LOGOUT_SUCCESS'
	| 'LOGOUT_FAILURE'
	| 'LOGOUT_END'
	| 'ACCOUNT_ADDED'
	| 'ACCOUNT_REMOVED'
	| 'INITIALIZE_START'
	| 'INITIALIZE_END'
	| 'RESTORE_FROM_BFCACHE';

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
// Configuration Types
// ============================================================================

/**
 * Protocol mode type
 */
export type ProtocolMode = 'AAD' | 'OIDC';

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
	protocolMode?: ProtocolMode;
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
 * Logger options for configuration
 */
export type LoggerOptions = {
	loggerCallback?: ILoggerCallback;
	piiLoggingEnabled?: boolean;
	logLevel?: LogLevel;
};

/**
 * Navigation options for navigation client
 */
export type NavigationOptions = {
	apiId: number;
	timeout: number;
	noHistory: boolean;
};

/**
 * Navigation client interface
 */
export interface INavigationClient {
	navigateInternal(url: string, options: NavigationOptions): Promise<boolean>;
	navigateExternal(url: string, options: NavigationOptions): Promise<boolean>;
}

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
// Account Filter Types
// ============================================================================

/**
 * Account filter type for querying accounts
 */
export type AccountFilter = {
	homeAccountId?: string;
	localAccountId?: string;
	username?: string;
	environment?: string;
	realm?: string;
	nativeAccountId?: string;
	loginHint?: string;
	tenantId?: string;
};

/**
 * Handle redirect promise options
 */
export type HandleRedirectPromiseOptions = {
	hash?: string;
};

// ============================================================================
// IPublicClientApplication Interface
// ============================================================================

/**
 * IPublicClientApplication interface from MSAL v5
 */
export interface IPublicClientApplication {
	initialize(request?: InitializeApplicationRequest): Promise<void>;
	acquireTokenPopup(request: PopupRequest): Promise<AuthenticationResult>;
	acquireTokenRedirect(request: RedirectRequest): Promise<void>;
	acquireTokenSilent(silentRequest: SilentRequest): Promise<AuthenticationResult>;
	acquireTokenByCode(request: AuthorizationCodeRequest): Promise<AuthenticationResult>;
	addEventCallback(
		callback: EventCallbackFunction,
		eventTypes?: Array<EventType>,
	): string | null;
	removeEventCallback(callbackId: string): void;
	addPerformanceCallback(callback: PerformanceCallbackFunction): string;
	removePerformanceCallback(callbackId: string): boolean;
	getAccount(accountFilter: AccountFilter): AccountInfo | null;
	getAllAccounts(accountFilter?: AccountFilter): AccountInfo[];
	handleRedirectPromise(
		options?: HandleRedirectPromiseOptions,
	): Promise<AuthenticationResult | null>;
	loginPopup(request?: PopupRequest): Promise<AuthenticationResult>;
	loginRedirect(request?: RedirectRequest): Promise<void>;
	logoutRedirect(logoutRequest?: EndSessionRequest): Promise<void>;
	logoutPopup(logoutRequest?: EndSessionPopupRequest): Promise<void>;
	ssoSilent(request: SsoSilentRequest): Promise<AuthenticationResult>;
	getLogger(): unknown;
	setLogger(logger: unknown): void;
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
