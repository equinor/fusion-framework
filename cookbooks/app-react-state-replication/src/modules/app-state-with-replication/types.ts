export type SyncEvent<Content extends object = object> = {
  id: string;
  type: 'change' | 'complete' | 'error' | 'denied' | 'paused' | 'active';
  info?: PouchDB.Replication.SyncResult<Content>;
  error?: unknown;
  timestamp: string;
};
