import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class SupabaseAdapter implements DatabaseAdapter {
  private supabase: SupabaseClient;
  private tableName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Must be service key to write
    this.tableName = process.env.SUPABASE_TABLE || 'postpipe_submissions';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async connect(): Promise<void> {
    // Supabase is stateless, just verify credentials with a light ping if possible
    // or just assume it works.
    console.log(`[SupabaseAdapter] Initialized for table '${this.tableName}'`);
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    const { submissionId, formId, data, ...rest } = payload;
    
    const { error } = await this.supabase
      .from(this.tableName)
      .insert({
        submission_id: submissionId,
        form_id: formId,
        data: data,
        metadata: rest,
      });

    if (error) {
      throw new Error(`Supabase Insert Error: ${error.message}`);
    }
    
    console.log(`[SupabaseAdapter] Saved submission ${submissionId}`);
  }

  async find(formId: string, options: { limit: number, cursor?: string }): Promise<{ data: any[], nextCursor?: string }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .limit(options.limit + 1);

    if (options.cursor) {
      query = query.lt('created_at', options.cursor);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("Supabase Find Error:", error);
      throw new Error(error.message);
    }

    if (!rows) return { data: [], nextCursor: undefined };

    const hasNext = rows.length > options.limit;
    const data = hasNext ? rows.slice(0, options.limit) : rows;

    let nextCursor: string | undefined = undefined;
    if (hasNext && data.length > 0) {
      nextCursor = data[data.length - 1].created_at;
    }
    
    // Transform if needed (Supabase returns object as is usually)
    const cleanData = data.map(row => ({
         ...row.data,
         id: row.submission_id,
         createdAt: row.created_at
    }));

    return { data: cleanData, nextCursor };
  }
}
