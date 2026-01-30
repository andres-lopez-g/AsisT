import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
if (process.env.DB_SSL === 'true' || isProduction) {
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

/**
 * Execute a query with optional RLS (Row Level Security) context
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {Object} options - Additional options
 * @param {number} options.userId - User ID for RLS context (required when RLS is enabled)
 * @returns {Promise} Query result
 */
const query = async (text, params, options = {}) => {
    const client = await pool.connect();
    try {
        // If userId is provided, set it as a session variable for RLS
        if (options.userId) {
            await client.query('SET LOCAL app.user_id = $1', [options.userId]);
        }
        
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
};

/**
 * Execute a transaction with optional RLS context
 * @param {Function} callback - Async function that receives a client and executes queries
 * @param {Object} options - Additional options
 * @param {number} options.userId - User ID for RLS context
 * @returns {Promise} Transaction result
 */
const transaction = async (callback, options = {}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // If userId is provided, set it as a session variable for RLS
        if (options.userId) {
            await client.query('SET LOCAL app.user_id = $1', [options.userId]);
        }
        
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default {
    query,
    transaction,
    pool
};
