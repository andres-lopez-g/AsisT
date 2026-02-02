import express from 'express';
import db from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add task
router.post('/', authenticate, async (req, res) => {
    const { title, date, status, priority, category } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO tasks (user_id, title, date, status, priority, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, title, date, status || 'todo', priority || 'medium', category || 'General']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update task
router.patch('/:id', authenticate, async (req, res) => {
    const { title, date, status, priority, category } = req.body;
    try {
        const result = await db.query(
            'UPDATE tasks SET title = COALESCE($1, title), date = COALESCE($2, date), status = COALESCE($3, status), priority = COALESCE($4, priority), category = COALESCE($5, category) WHERE id = $6 AND user_id = $7 RETURNING *',
            [title, date, status, priority, category, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
