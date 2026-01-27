import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Fix for SELF_SIGNED_CERT_IN_CHAIN on Vercel/Supabase
// SECURITY WARNING: Disabling TLS rejection is a risk (MITM attacks).
// This is used here to allow connections to some hosted DBs with self-signed certs.
// In a highly secure production environment, you should use proper CA certificates.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

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

// SSL is required for Supabase/Vercel
// We use rejectUnauthorized: false to allow self-signed certs common in cloud providers
poolConfig.ssl = {
    rejectUnauthorized: false
};

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
