import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("CRITICAL: Supabase credentials missing in environment variables. Falling back to placeholders which will fail network requests.");
    console.error("Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.");
}

const url = SUPABASE_URL || "https://placeholder.supabase.co";
const key = SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient<Database>(url, key, {
    auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
    }
});
