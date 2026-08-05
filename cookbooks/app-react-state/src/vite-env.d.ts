/** Ambient `import.meta.env` typing for the Vite-injected `FUSION_SPA_*` variables this cookbook reads. */
interface ImportMetaEnv {
  readonly FUSION_SPA_COUCHDB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
