
import * as supabase from './supabase';
import * as mockProvider from './firebase';
import type { DatabaseProvider } from './types';

// Check if Supabase is configured and the user wants to use it
const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_DB_PROVIDER === 'supabase'
  );
};

// Otherwise, it defaults to the mock provider.
const getProvider = (): DatabaseProvider => {
  // Check if we should use dummy data only
  if (import.meta.env.VITE_USE_DUMMY_ONLY === 'true') {
    return mockProvider as unknown as DatabaseProvider;
  }

  // Check if Supabase is configured and selected
  if (isSupabaseConfigured()) {
    return supabase as unknown as DatabaseProvider;
  }

  // Default to mock provider if Supabase is not the chosen provider
  console.log('Using mock provider');
  return mockProvider as unknown as DatabaseProvider;
};

const db = getProvider();

export { db };
