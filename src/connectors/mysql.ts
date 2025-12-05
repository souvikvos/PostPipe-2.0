import mysql from 'mysql2/promise';

const MYSQL_URI = process.env.DATABASE_URI;

if (!MYSQL_URI) {
  throw new Error('Please define the DATABASE_URI environment variable inside .env');
}

let pool: mysql.Pool;

if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
        uri: MYSQL_URI,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

pool = global.mysqlPool;

export default pool;

declare global {
    var mysqlPool: mysql.Pool | undefined;
}
