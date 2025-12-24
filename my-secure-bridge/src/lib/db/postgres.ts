import { Pool } from 'pg';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;
  private tableName: string;

  constructor() {
    const connectionString = process.env.POSTGRES_URI;
    this.tableName = process.env.POSTGRES_TABLE || 'postpipe_submissions';

    if (!connectionString) {
      throw new Error("POSTGRES_URI is required for PostgresAdapter");
    }

    this.pool = new Pool({
      connectionString,
    });
  }

  async connect(): Promise<void> {
    // Test connection
    const client = await this.pool.connect();
    try {
      // Ensure table exists (Auto-migration for convenience)
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          submission_id TEXT UNIQUE NOT NULL,
          form_id TEXT NOT NULL,
          data JSONB NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log(`[PostgresAdapter] Connected & Verified table '${this.tableName}'`);
    } finally {
      client.release();
    }
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    const { submissionId, formId, data, ...rest } = payload;
    
    const query = `
      INSERT INTO ${this.tableName} (submission_id, form_id, data, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    const values = [
      submissionId,
      formId,
      JSON.stringify(data),
      JSON.stringify(rest) // Store signature, timestamp etc in metadata
    ];

    await this.pool.query(query, values);
    await this.pool.query(query, values);
    console.log(`[PostgresAdapter] Saved submission ${submissionId}`);
  }

  async find(formId: string, options: { limit: number, cursor?: string }): Promise<{ data: any[], nextCursor?: string }> {
    const limit = Math.min(options.limit, 100); // Enforce max limit for safety
    
    let query = `
      SELECT data, created_at, submission_id
      FROM ${this.tableName}
      WHERE form_id = $1
    `;
    
    const params: any[] = [formId];
    
    if (options.cursor) {
      query += ` AND created_at < $2`;
      params.push(options.cursor); // Expects ISO string
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit + 1);

    const res = await this.pool.query(query, params);
    const rows = res.rows;
    
    const hasNext = rows.length > limit;
    const data = hasNext ? rows.slice(0, limit) : rows;
    
    // Transform rows to match generic data shape if needed, 
    // or just return the stored `data` JSON blob merged with some metadata.
    const cleanData = data.map((row: any) => ({
        ...row.data,
        id: row.submission_id,
        createdAt: row.created_at
    }));

    let nextCursor: string | undefined = undefined;
    if (hasNext && data.length > 0) {
      nextCursor = data[data.length - 1].created_at.toISOString();
    }

    return {
      data: cleanData,
      nextCursor
    };
  }
}
