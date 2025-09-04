import * as mockProvider from './firebase';

// This type represents the interface of a database provider.
// It should include all the functions that are exported from `src/lib/db/firebase.ts`.
export type DatabaseProvider = typeof mockProvider;
