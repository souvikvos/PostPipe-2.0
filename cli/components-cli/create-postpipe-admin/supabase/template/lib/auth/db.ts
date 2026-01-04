// This file exists only to satisfy the linter in the CLI template directory.
// It is NOT copied to the user's project by create-postpipe-admin.
// The real db.ts is provided by create-postpipe-auth.

import { SupabaseClient } from '@supabase/supabase-js';

export const createClient = async (): Promise<SupabaseClient> => {
    return {} as SupabaseClient;
};
