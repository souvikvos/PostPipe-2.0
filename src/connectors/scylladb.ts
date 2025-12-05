import { Client } from 'cassandra-driver';

const SCYLLA_URI = process.env.DATABASE_URI;
const SCYLLA_KEYSPACE = process.env.SCYLLA_KEYSPACE || 'postpipe';

if (!SCYLLA_URI) {
  throw new Error('Please define the DATABASE_URI environment variable inside .env');
}

// Extract contact points from URI or assume it's a comma-separated list of IPs
// Example URI: scylla://127.0.0.1:9042,127.0.0.2:9042
// For simplicity, we'll assume the user provides just the contact points or a standard URI we parse manually if needed.
// But standard cassandra drivers usually take contactPoints array.
// Let's assume DATABASE_URI is just the contact point for now or a full URI.

// A simple parser for demonstration if the user pastes a connection string
const contactPoints = SCYLLA_URI.replace('scylla://', '').split(',');

const client = new Client({
  contactPoints: contactPoints,
  localDataCenter: 'datacenter1', // Default, should be configurable
  keyspace: SCYLLA_KEYSPACE
});

let isConnected = false;

export async function dbConnect() {
    if (isConnected) return client;
    
    try {
        await client.connect();
        isConnected = true;
        console.log('Connected to ScyllaDB');
        return client;
    } catch (err) {
        console.error('Failed to connect to ScyllaDB', err);
        throw err;
    }
}

export default client;
