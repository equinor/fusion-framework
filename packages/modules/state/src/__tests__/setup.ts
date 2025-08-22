// test/setup.ts
import 'fake-indexeddb/auto';  // Sets up global indexedDB, IDBKeyRange, etc.
import PouchDB from 'pouchdb';
import PouchDBIDBAdapter from 'pouchdb-adapter-idb';  // Explicitly import idb adapter

// Register idb adapter
PouchDB.plugin(PouchDBIDBAdapter);
