import express from 'express';
import db from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Get all transactions for user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, id DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add transaction
router.post('/', authenticate, async (req, res) => {
    const { title, amount, type, category, date } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, title, amount, type, category, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete transaction
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure user owns transaction
        const result = await db.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
