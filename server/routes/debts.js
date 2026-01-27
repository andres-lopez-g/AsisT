import express from 'express';
import db from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Get all debts for user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM debts WHERE user_id = $1 ORDER BY start_date DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new debt
router.post('/', authenticate, async (req, res) => {
    const { title, total_amount, interest_rate, installments_total, start_date, due_day } = req.body;

    if (!title || !total_amount || !installments_total || !start_date) {
        return res.status(400).json({ error: 'Missing required fields: title, total_amount, installments_total, and start_date are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO debts (user_id, title, total_amount, remaining_amount, interest_rate, installments_total, start_date, due_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [req.user.id, title, total_amount, total_amount, interest_rate || 0, installments_total, start_date, due_day || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: `Server error: ${err.message}` });
    }
});

// Record a payment for a debt
router.post('/:id/payments', authenticate, async (req, res) => {
    const { id } = req.params;
    const { amount, payment_date } = req.body;

    try {
        // Start transaction
        await db.query('BEGIN');

        // Check if debt exists and belongs to user
        const debtCheck = await db.query('SELECT * FROM debts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (debtCheck.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Debt not found' });
        }

        const debt = debtCheck.rows[0];
        const newRemaining = parseFloat(debt.remaining_amount) - parseFloat(amount);
        const newInstallmentsPaid = debt.installments_paid + 1;

        // Insert payment
        await db.query(
            'INSERT INTO debt_payments (debt_id, amount, payment_date) VALUES ($1, $2, $3)',
            [id, amount, payment_date]
        );

        // Update debt status
        const updatedDebt = await db.query(
            'UPDATE debts SET remaining_amount = $1, installments_paid = $2 WHERE id = $3 RETURNING *',
            [newRemaining, newInstallmentsPaid, id]
        );

        // Also record as a finance transaction (expense)
        await db.query(
            'INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, `Payment: ${debt.title}`, amount, 'expense', 'Debt Payment', payment_date]
        );

        await db.query('COMMIT');
        res.json(updatedDebt.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete debt
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Debt not found' });
        res.json({ message: 'Debt deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
