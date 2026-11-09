/** Public base path of the docs site; `VUEPRESS_BASE` overrides it for local serving. */
export const siteBase = (process.env.VUEPRESS_BASE ?? '/fusion-framework/') as '/' | `/${string}/`;
