export type SyncEvent<Content extends {} = {}> = {
  id: string;
  type: 'change' | 'complete' | 'error' | 'denied' | 'paused' | 'active';
  info?: PouchDB.Replication.SyncResult<Content>;
  error?: unknown;
  timestamp: string;
};
