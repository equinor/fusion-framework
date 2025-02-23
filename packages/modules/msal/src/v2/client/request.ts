import type { PopupRequest, RedirectRequest } from '@azure/msal-browser';

/**
 * Request object passed by user to retrieve a Code from the
 * server (first leg of authorization code grant flow).
 *
 * **scopes**\
 * Array of scopes the application is requesting access to.
 *
 * **authority**\
 * Url of the authority which the application acquires tokens from.
 *
 * **correlationId**\
 * Unique GUID set per request to trace a request end-to-end for telemetry purposes.
 *
 * **redirectUri**\
 * The redirect URI where authentication responses can be received by your application. It must exactly match one of the redirect URIs registered in the Azure portal.
 *
 * **extraScopesToConsent**\
 * Scopes for a different resource when the user needs consent upfront.
 *
 * **responseMode**\
 * Specifies the method that should be used to send the authentication result to your app. Fragment is the only valid option for msal-browser.
 *
 * **codeChallenge**\
 * Used to secure authorization code grant via Proof of Key for Code Exchange (PKCE). For more information, see the PKCE RCF:https://tools.ietf.org/html/rfc7636
 *
 * **codeChallengeMethod**\
 * The method used to encode the code verifier for the code challenge parameter. Can be "plain" or "S256". If excluded, code challenge is assumed to be plaintext. For more information, see the PKCE RCF: https://tools.ietf.org/html/rfc7636
 *
 * **state**\
 * A value included in the request that is also returned in the token response. A randomly generated unique value is typically used for preventing cross site request forgery attacks. The state is also used to encode information about the user's state in the app before the authentication request occurred.
 *
 * **prompt**\
 * Indicates the type of user interaction that is required.
 * - login: will force the user to enter their credentials on that request, negating single-sign on
 * - none:  will ensure that the user isn't presented with any interactive prompt. if request can't be completed via single-sign on, the endpoint will return an interaction_required error
 * - consent: will the trigger the OAuth consent dialog after the user signs in, asking the user to grant permissions to the app
 * - select_account: will interrupt single sign-=on providing account selection experience listing all the accounts in session or any remembered accounts or an option to choose to use a different account
 *
 * **loginHint**\
 * Can be used to pre-fill the username/email address field of the sign-in page for the user, if you know the username/email address ahead of time. Often apps use this parameter during re-authentication, having already extracted the username from a previous sign-in using the preferred_username claim.
 *
 * **sid**\
 * Session ID, unique identifier for the session. Available as an optional claim on ID tokens.
 *
 * **domainHint**\
 * Provides a hint about the tenant or domain that the user should use to sign in. The value of the domain hint is a registered domain for the tenant.
 *
 * **extraQueryParameters**\
 * String to string map of custom query parameters.
 *
 * **claims**\
 * In cases where Azure AD tenant admin has enabled conditional access policies, and the policy has not been met, exceptions will contain claims that need to be consented to.
 *
 * **nonce**\
 * A value included in the request that is returned in the id token. A randomly generated unique value is typically used to mitigate replay attacks.
 *
 * **redirectStartPage**\
 * The page that should be returned to after loginRedirect or acquireTokenRedirect.
 * This should only be used if this is different from the redirectUri and will default to the page that initiates the request.
 * When the navigateToLoginRequestUrl config option is set to false this parameter will be ignored.
 *
 * @see [microsoft-authentication-library-for-js](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser/src/request)
 */
export type AuthRequest = PopupRequest | RedirectRequest;
