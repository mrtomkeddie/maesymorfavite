import * as firestore from '@/lib/firebase/firestore';

// This type defines the interface for our database provider.
// It should include all the functions that are exported from `src/lib/firebase/firestore.ts`.
export type DatabaseProvider = typeof firestore;
