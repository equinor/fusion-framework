/**
 * Re-exports of core MSAL types from @azure/msal-browser.
 *
 * This module provides convenient access to commonly used MSAL types without
 * requiring direct imports from @azure/msal-browser. These types represent
 * fundamental authentication entities used throughout the MSAL module.
 *
 * @module
 */

export {
  /** Represents account information for an authenticated user */
  AccountInfo,
  /** Represents the result of an authentication operation including tokens and account */
  AuthenticationResult,
} from '@azure/msal-browser';
