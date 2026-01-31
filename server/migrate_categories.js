import pg from 'pg';
import dotenv from 'dotenv';
import { cleanConnectionString } from './utils/dbConfig.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Remove sslmode parameter from connection string if present
connectionString = cleanConnectionString(connectionString);

// Always enable SSL for cloud databases (when a connection string is provided), 
// or when explicitly enabled via DB_SSL or in production
const sslEnabled = connectionString || process.env.DB_SSL === 'true' || isProduction;

const pool = new pg.Pool({
    connectionString: connectionString || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false
});

async function migrate() {
    try {
        console.log('Applying categories migration...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'task')),
                color VARCHAR(7) DEFAULT '#2eaadc',
                icon VARCHAR(50), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, name, type)
            );
            CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);
        `);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
