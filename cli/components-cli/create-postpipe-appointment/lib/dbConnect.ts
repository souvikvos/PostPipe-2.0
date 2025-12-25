import mongoose from 'mongoose';

const DATABASE_URI = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!DATABASE_URI) {
    throw new Error(
        'Please define the DATABASE_URI environment variable inside .env'
    );
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

// @ts-ignore
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(DATABASE_URI as string, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
