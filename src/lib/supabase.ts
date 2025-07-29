
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// This is the client-side Supabase client.
// It will only be initialized if the required environment variables are present.
// This prevents errors in environments where Supabase is not configured.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createPagesBrowserClient({
        supabaseUrl,
        supabaseKey: supabaseAnonKey,
      })
    : ({} as SupabaseClient);


// A helper function to get the current user session
export async function getSession(): Promise<Session | null> {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
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

    return data ? data.role : null;
}


// A helper function to get the Supabase client.
// This is used in the database implementation files.
export function getSupabaseClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase is not configured. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
    }
    return supabase;
}
