import pg from 'pg';
import dotenv from 'dotenv';
import { cleanConnectionString } from './utils/dbConfig.js';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Support both individual variables and a full connection string (common in Vercel/Neon/Supabase)
let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Remove sslmode parameter from connection string if present
// We'll handle SSL configuration separately to ensure it works with self-signed certs
connectionString = cleanConnectionString(connectionString);

const poolConfig = connectionString
    ? { 
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
    };

// SSL is required for Supabase/Vercel and most cloud database providers
// WARNING: rejectUnauthorized: false disables SSL certificate verification
// This makes the connection vulnerable to man-in-the-middle attacks
// This is used here to support cloud providers with self-signed certificates
// For maximum security, consider:
// 1. Using proper CA certificates from your cloud provider
// 2. Setting rejectUnauthorized: true in production with valid certs
// 3. Using connection strings that include proper SSL configuration
// For individual connection parameters, enable SSL when explicitly set or in production
if (!connectionString && (process.env.DB_SSL === 'true' || isProduction)) {
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
    console.error('Unexpected error on idle database client:', err);
    // Don't exit the process - let the pool handle recovery
    // The failed client will be removed from the pool automatically
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
        // Start a transaction to ensure SET LOCAL persists for the query
        await client.query('BEGIN');
        
        // If userId is provided, set it as a session variable for RLS
        if (options.userId) {
            await client.query('SET LOCAL app.user_id = $1', [options.userId]);
        }
        
        const result = await client.query(text, params);
        
        // Commit the transaction
        await client.query('COMMIT');
        return result;
    } catch (error) {
        // Rollback on error
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        throw error;
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
