import * as firebaseProvider from './firebase';

// This type defines the interface for our database provider.
// It should include all the functions that are exported from `src/lib/db/firebase.ts`.
export type DatabaseProvider = typeof firebaseProvider;
