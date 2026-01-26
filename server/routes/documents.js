import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Improved Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all documents for user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload document
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
    const { category } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const type = path.extname(file.originalname).substring(1);
        const size = (file.size / 1024 / 1024).toFixed(1) + ' MB';

        const result = await db.query(
            'INSERT INTO documents (user_id, name, type, size, category, file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, file.originalname, type, size, category || 'General', file.path]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting document record:', err);
        // Clean up uploaded file if DB fails
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        res.status(500).json({ error: 'Failed to record document metadata' });
    }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete physical file
        const filePath = result.rows[0].file_path;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Document deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
