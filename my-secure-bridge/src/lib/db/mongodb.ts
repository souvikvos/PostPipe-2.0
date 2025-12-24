import { MongoClient, Db } from 'mongodb';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class MongoAdapter implements DatabaseAdapter {
  private client: MongoClient;
  private db: Db | null = null;
  private uri: string;
  private dbName: string;
  private collectionName: string;

  constructor() {
    this.uri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB_NAME || 'postpipe_data';
    this.collectionName = process.env.MONGODB_COLLECTION || 'submissions';

    if (!this.uri) {
      throw new Error("MONGODB_URI is required for MongoAdapter");
    }
    
    this.client = new MongoClient(this.uri);
  }

  async connect(): Promise<void> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log(`[MongoAdapter] Connected to ${this.dbName}`);
    }
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    if (!this.db) await this.connect();
    
    // We store the whole payload, or just the data?
    // "Connector Logic: Persist data to database"
    // Usually we want the metadata too (submissionId, timestamp).
    // Let's store the whole object.
    
    await this.db!.collection(this.collectionName).insertOne({
      ...payload,
      _receivedAt: new Date()
    });
    
    console.log(`[MongoAdapter] Saved submission ${payload.submissionId}`);
  }

  async find(formId: string, options: { limit: number, cursor?: string }): Promise<{ data: any[], nextCursor?: string }> {
    if (!this.db) await this.connect();

    const query: any = { formId };
    
    // Cursor handling (using receivedAt timestamp for simple cursor)
    // Real implementation ideally uses a robust cursor strategy (e.g. base64 encoded last ID + timestamp)
    // Here we assume cursor is the last Item's _id (ObjectId) or a timestamp string.
    // For simplicity, let's use standard ObjectId based pagination if _id is used, 
    // or timestamp if we want consistent ordering.
    // Given we insert with `_receivedAt`, let's try to simple string comparison if cursor is provided.
    
    if (options.cursor) {
        // Assume cursor is base64(timestamp) or just an ID. 
        // Let's use `_receivedAt` as cursor for time-based ordering.
       try {
         const lastTime = new Date(options.cursor);
         if (!isNaN(lastTime.getTime())) {
            query._receivedAt = { $lt: lastTime };
         }
       } catch (e) {
         // ignore invalid cursor
       }
    }

    const docs = await this.db!.collection(this.collectionName)
      .find(query)
      .sort({ _receivedAt: -1 })
      .limit(options.limit + 1) // Fetch one extra to check for next page
      .toArray();

    const hasNext = docs.length > options.limit;
    const data = hasNext ? docs.slice(0, options.limit) : docs;
    
    let nextCursor: string | undefined = undefined;
    if (hasNext && data.length > 0) {
       const lastItem = data[data.length - 1];
       // @ts-ignore
       if (lastItem._receivedAt) {
          // @ts-ignore
          nextCursor = lastItem._receivedAt.toISOString();
       }
    }

    return {
      data,
      nextCursor
    };
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
