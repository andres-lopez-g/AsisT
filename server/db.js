import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || !!process.env.VERCEL;

// Support both individual variables and a full connection string (common in Vercel/Neon/Supabase)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const poolConfig = connectionString
    ? { connectionString }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
    };

// SSL is required for Supabase/Vercel and most cloud database providers
// We use rejectUnauthorized: false to allow self-signed certs common in cloud providers
// Always enable SSL for connection strings (typically used for remote databases)
// or when explicitly enabled via DB_SSL or in production environments
if (connectionString || process.env.DB_SSL === 'true' || isProduction) {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

// Diagnostic log (without sensitive data)
console.log(`[DB] Initializing connection to ${poolConfig.host || 'External URL'} (SSL: ${!!poolConfig.ssl})`);
if (!poolConfig.connectionString && !poolConfig.host) {
    console.error('[DB] WARNING: No database host or connection string provided! Defaulting to localhost.');
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

export default {
    query: (text, params) => pool.query(text, params),
};
