import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';
import { MongoAdapter } from './mongodb';

export function getAdapter(): DatabaseAdapter {
  const type = process.env.DB_TYPE?.toLowerCase();

  switch (type) {
    case 'mongodb':
      return new MongoAdapter();
    default:
      console.warn(`[Config] No valid DB_TYPE set (got '${type}'). Defaulting to Memory (Dry Run).`);
      return new MemoryAdapter();
  }
}

class MemoryAdapter implements DatabaseAdapter {
  async connect() {
    console.log("[MemoryAdapter] Connected (Data will be lost on restart)");
  }
  async insert(submission: PostPipeIngestPayload): Promise<void> {
    console.log('[MemoryAdapter] Inserted:', submission);
  }
  async query(formId: string, limit?: number): Promise<PostPipeIngestPayload[]> {
      return [];
  }
}
