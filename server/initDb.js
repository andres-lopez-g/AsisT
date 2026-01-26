import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    try {
        const sqlPath = path.join(__dirname, 'db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running schema migration...');
        await db.query(sql);
        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
