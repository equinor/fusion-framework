export type Service = {
  key: string;
  uri: string;
  scopes?: string[];
  id?: string;
  name?: string;
  tags?: string[];

  /**
   * @deprecated use scopes instead
   */
  defaultScopes: string[];
};
