import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function runMigration() {
    let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    // Remove sslmode parameter from connection string if present
    if (connectionString) {
        connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
        connectionString = connectionString.replace(/\?&/, '?');
        connectionString = connectionString.replace(/\?$/, '');
    }
    
    const isCloud = !!connectionString;
    const dbName = process.env.DB_NAME || 'fusion_observatory';

    try {
        let client;

        if (isCloud) {
            console.log('Connecting to cloud database...');
            client = new Client({
                connectionString: connectionString,
                ssl: { rejectUnauthorized: false }
            });
        } else {
            console.log('Connecting to local database...');
            client = new Client({
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: dbName,
            });
        }

        await client.connect();

        // Run currency support migration
        const migrationPath = path.join(__dirname, 'migrations', 'migration_currency_support.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running currency support migration...');
        await client.query(migrationSql);
        console.log('Currency support migration completed successfully.');

        await client.end();
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    }
}

runMigration();
