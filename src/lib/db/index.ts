
import * as firebase from './firebase';
import * as supabase from './supabase';
import { DatabaseProvider } from './types';

// This function determines which database provider to use.
// It checks an environment variable. If the variable is set to 'supabase',
// and the necessary keys are present, it uses the Supabase provider. 
// Otherwise, it defaults to the mock Firebase provider.
const getDbProvider = (): DatabaseProvider => {
    // Check if Supabase environment variables are present and not empty
    const isSupabaseConfigured = 
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (process.env.NEXT_PUBLIC_DB_PROVIDER === 'supabase' && isSupabaseConfigured) {
        return supabase;
    }
    
    // Default to Firebase mock provider if Supabase is not the chosen provider
    // or if the Supabase credentials are not fully configured.
    return firebase;
}

const db = getDbProvider();

export { db };
