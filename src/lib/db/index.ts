
import * as firebase from './firebase';
import * as supabase from './supabase';
import { DatabaseProvider } from './types';
import { isSupabaseReady } from '@/lib/supabase';

// This function determines which database provider to use.
// It checks an environment variable. If the variable is set to 'supabase',
// and the necessary keys are present, it uses the Supabase provider. 
// Otherwise, it defaults to the mock Firebase provider.
const getDbProvider = (): DatabaseProvider => {
    // Allow forcing dummy/mock mode regardless of Supabase env via flag
    const useDummyOnly = import.meta.env.VITE_USE_DUMMY_ONLY === 'true';

    // Check if Supabase environment variables are present and not empty
    const isSupabaseConfigured = 
        !!import.meta.env.VITE_SUPABASE_URL &&
        !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Short-circuit to mock provider when dummy-only mode is enabled
    if (useDummyOnly) {
        return firebase as unknown as DatabaseProvider;
    }

    // Only select supabase when explicitly requested, configured, and client is healthy
    if (import.meta.env.VITE_DB_PROVIDER === 'supabase' && isSupabaseConfigured && isSupabaseReady()) {
        return supabase as unknown as DatabaseProvider;
    }
    
    // Default to Firebase mock provider if Supabase is not the chosen provider
    // or if the Supabase credentials are not fully configured/healthy.
    return firebase as unknown as DatabaseProvider;
}

const db = getDbProvider();

export { db };
