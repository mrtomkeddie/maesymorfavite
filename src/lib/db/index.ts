
import * as firebase from './firebase';
import * as supabase from './supabase';
import { DatabaseProvider } from './types';

// This function determines which database provider to use.
// It checks an environment variable. If the variable is set to 'supabase',
// it uses the Supabase provider. Otherwise, it defaults to the mock
// Firebase provider. This allows for easy switching between a live
// database for production and mock data for development.
const getDbProvider = (): DatabaseProvider => {
    if (process.env.NEXT_PUBLIC_DB_PROVIDER === 'supabase') {
        return supabase;
    }
    return firebase;
}

const db = getDbProvider();

export { db };
