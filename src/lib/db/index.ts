
import * as firebase from './firebase';
import * as supabase from './supabase';
import { DatabaseProvider } from './types';

// This function determines which database provider to use.
// It checks an environment variable. If the variable is set to 'supabase',
// and the necessary keys are present, it uses the Supabase provider. 
// Otherwise, it defaults to the mock Firebase provider.
const getDbProvider = (): DatabaseProvider => {
    const isSupabaseConfigured = 
        process.env.NEXT_PUBLIC_DB_PROVIDER === 'supabase' &&
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (isSupabaseConfigured) {
        return supabase;
    }
    return firebase;
}

const db = getDbProvider();

export { db };
