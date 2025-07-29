
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// This is the client-side Supabase client
export const supabase = createPagesBrowserClient();

// A helper function to get the current user session
export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// A helper function to get the user's role from the database
export async function getUserRole(userId: string): Promise<string | null> {
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
    return supabase;
}
