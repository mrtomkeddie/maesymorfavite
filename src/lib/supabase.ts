
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// This is the client-side Supabase client
export const supabase = createPagesBrowserClient();

// A helper function to get the current user session
export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// A helper function to get the Supabase client.
// This is used in the database implementation files.
export function getSupabaseClient(): SupabaseClient {
    return supabase;
}
