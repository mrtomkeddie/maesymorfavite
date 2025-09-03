
import { createClient } from '@supabase/supabase-js';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// This is the client-side Supabase client.
// It will only be initialized if the required environment variables are present.
// This prevents errors in environments where Supabase is not configured.
const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseUrl = supabaseUrlRaw.trim();
const supabaseAnonKey = supabaseAnonKeyRaw.trim();
const useDummyOnly = import.meta.env.VITE_USE_DUMMY_ONLY === 'true';
const strictSupabaseMode = import.meta.env.VITE_DB_PROVIDER === 'supabase' && !useDummyOnly;

// Create a mock client if environment variables are not available or dummy-only mode is enabled
const createMockClient = (): SupabaseClient => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
} as any);

let supabaseClient: SupabaseClient;

try {
  // In strict mode we require a real, valid client and never fall back to mock
  if (strictSupabaseMode) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase is required in strict mode. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    // Validate URL format early to avoid constructor errors in some runtimes
    try {
      // eslint-disable-next-line no-new
      new URL(supabaseUrl);
    } catch {
      throw new Error(`Supabase URL is invalid. Received: "${supabaseUrl}"`);
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Only create real client if we are not in dummy-only mode and have valid environment variables
    if (!useDummyOnly && supabaseUrl && supabaseAnonKey) {
      try {
        // eslint-disable-next-line no-new
        new URL(supabaseUrl);
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('Using mock Supabase client (invalid URL or env not configured).', {
            strictSupabaseMode,
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
            useDummyOnly,
            urlSample: supabaseUrl,
          });
        } else {
          console.warn('Using mock Supabase client (invalid URL or env not configured)');
        }
        supabaseClient = createMockClient();
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('Using mock Supabase client (dummy mode or env not configured).', {
          strictSupabaseMode,
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          useDummyOnly,
        });
      } else {
        console.warn('Using mock Supabase client (dummy mode or env not configured)');
      }
      supabaseClient = createMockClient();
    }
  }
} catch (error: any) {
  console.warn('Failed to initialize Supabase client, using mock client:', error?.message || error);
  supabaseClient = createMockClient();
}

export const supabase = supabaseClient;

// Helper to determine if a real Supabase client is available
export function isSupabaseReady(): boolean {
  // Must have env and the constructed client must expose the query interface
  return !!supabaseUrl && !!supabaseAnonKey && typeof (supabase as any)?.from === 'function';
}

// A helper function to get the current user session
export async function getSession(): Promise<Session | null> {
    if (useDummyOnly) return null;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// A helper function to get the Supabase client.
// This is used in the database implementation files.
export function getSupabaseClient(): SupabaseClient {
    if (useDummyOnly) {
        throw new Error("Supabase is disabled in dummy-only mode.");
    }
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
    }
    // Guard against accidentally returning a mock client without query methods
    if (typeof (supabase as any)?.from !== 'function') {
        throw new Error("Supabase client is not fully initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or disable Supabase by setting VITE_USE_DUMMY_ONLY=true.");
    }
    return supabase;
}

// A helper function to get the user's role from the database
export async function getUserRole(userId: string): Promise<string | null> {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // 'PGRST116' means no rows found, which is fine.
        console.error("Error fetching user role:", error);
        return null;
    }

    return data ? (data as any).role : null;
}
