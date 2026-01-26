import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function setup() {
    const dbName = process.env.DB_NAME || 'fusion_observatory';

    // Step 1: Connect to 'postgres' database to create the target database
    const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres', // Connect to default DB
    });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Creating database "${dbName}"...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
        await client.end();

        // Step 2: Connect to the new database and run schema
        const targetClient = new Client({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: dbName,
        });

        await targetClient.connect();
        const sqlPath = path.join(__dirname, 'db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying schema from db.sql...');
        await targetClient.query(sql);
        console.log('Schema applied successfully.');

        await targetClient.end();
        console.log('Database setup completed successfully.');
    } catch (err) {
        console.error('Error during database setup:', err);
        process.exit(1);
    }
}

setup();
