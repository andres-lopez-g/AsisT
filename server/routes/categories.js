import express from 'express';
import db from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET all categories for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST to create a new category
router.post('/', authenticate, async (req, res) => {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO categories (user_id, name, type, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name, type, color || '#2eaadc', icon || 'Tag']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Category already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH to update a category
router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    try {
        const result = await db.query(
            'UPDATE categories SET name = COALESCE($1, name), color = COALESCE($2, color), icon = COALESCE($3, icon) WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, color, icon, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a category
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found or unauthorized' });
        }

        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
