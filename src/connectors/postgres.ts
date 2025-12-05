import { Pool } from 'pg';

const POSTGRES_URI = process.env.DATABASE_URI;

if (!POSTGRES_URI) {
  throw new Error('Please define the DATABASE_URI environment variable inside .env');
}

let pool: Pool;

if (!global.postgresPool) {
    global.postgresPool = new Pool({
        connectionString: POSTGRES_URI,
    });
}

pool = global.postgresPool;

export default pool;

// Type definition for global
declare global {
    var postgresPool: Pool | undefined;
}
