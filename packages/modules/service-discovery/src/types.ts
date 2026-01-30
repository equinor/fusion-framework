export type Service = {
  key: string;
  uri: string;
  scopes?: string[];
  id?: string;
  name?: string;
  tags?: string[];
  /**
   * Indicates whether this service configuration has been overridden via
   * session storage.
   *
   * Used by the service override priority system to distinguish between
   * persisted overrides and default configuration values.
   */
  overridden?: boolean;

  /**
   * @deprecated use scopes instead
   */
  defaultScopes: string[];
};
