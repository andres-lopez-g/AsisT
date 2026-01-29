/**
 * Smart Features API Routes
 * Exposes intelligent features: categorization, recurring, forecasting, debt optimization, task intelligence, analytics
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// Import services
const categorization = require('../services/categorization');
const recurring = require('../services/recurring');
const forecasting = require('../services/forecasting');
const debtOptimizer = require('../services/debtOptimizer');
const taskIntelligence = require('../services/taskIntelligence');
const analytics = require('../services/analytics');

// ============================================
// CATEGORIZATION ENDPOINTS
// ============================================

/**
 * POST /api/smart/categorize
 * Get category suggestion for a transaction
 */
router.post('/categorize', async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;

        const suggestion = await categorization.suggestCategory(db, userId, title);
        res.json(suggestion);
    } catch (error) {
        console.error('Error suggesting category:', error);
        res.status(500).json({ error: 'Failed to suggest category' });
    }
});

/**
 * POST /api/smart/categorize/learn
 * Learn from user's categorization choice
 */
router.post('/categorize/learn', async (req, res) => {
    try {
        const { title, category } = req.body;
        const userId = req.user.id;

        await categorization.learnFromChoice(db, userId, title, category);
        res.json({ success: true });
    } catch (error) {
        console.error('Error learning categorization:', error);
        res.status(500).json({ error: 'Failed to learn categorization' });
    }
});

/**
 * GET /api/smart/categorize/rules
 * Get all learned categorization rules
 */
router.get('/categorize/rules', async (req, res) => {
    try {
        const userId = req.user.id;
        const rules = await categorization.getUserRules(db, userId);
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});

// ============================================
// RECURRING TRANSACTION ENDPOINTS
// ============================================

/**
 * POST /api/smart/recurring/detect
 * Detect recurring transactions
 */
router.post('/recurring/detect', async (req, res) => {
    try {
        const userId = req.user.id;

        const detected = await recurring.detectRecurring(db, userId);
        await recurring.saveRecurring(db, userId, detected);

        res.json({ detected: detected.length, recurring: detected });
    } catch (error) {
        console.error('Error detecting recurring:', error);
        res.status(500).json({ error: 'Failed to detect recurring transactions' });
    }
});

/**
 * GET /api/smart/recurring
 * Get all recurring transactions
 */
router.get('/recurring', async (req, res) => {
    try {
        const userId = req.user.id;
        const recurringList = await recurring.getRecurring(db, userId);
        res.json(recurringList);
    } catch (error) {
        console.error('Error fetching recurring:', error);
        res.status(500).json({ error: 'Failed to fetch recurring transactions' });
    }
});

/**
 * PUT /api/smart/recurring/:id/toggle
 * Toggle recurring transaction active status
 */
router.put('/recurring/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const userId = req.user.id;

        await recurring.toggleRecurring(db, userId, id, isActive);
        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling recurring:', error);
        res.status(500).json({ error: 'Failed to toggle recurring transaction' });
    }
});

/**
 * DELETE /api/smart/recurring/:id
 * Delete recurring transaction
 */
router.delete('/recurring/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await recurring.deleteRecurring(db, userId, id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting recurring:', error);
        res.status(500).json({ error: 'Failed to delete recurring transaction' });
    }
});

// ============================================
// FORECASTING ENDPOINTS
// ============================================

/**
 * GET /api/smart/forecast
 * Get balance forecast
 */
router.get('/forecast', async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 90 } = req.query;

        // Get current balance from transactions
        const balanceResult = await db.query(
            `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END), 0) as balance
       FROM transactions
       WHERE user_id = $1`,
            [userId]
        );

        const currentBalance = parseFloat(balanceResult.rows[0]?.balance || 0);
        const forecast = await forecasting.generateForecast(db, userId, currentBalance, parseInt(days));

        res.json(forecast);
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({ error: 'Failed to generate forecast' });
    }
});

/**
 * PUT /api/smart/forecast/settings
 * Update forecast settings
 */
router.put('/forecast/settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = req.body;

        await forecasting.updateForecastSettings(db, userId, settings);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating forecast settings:', error);
        res.status(500).json({ error: 'Failed to update forecast settings' });
    }
});

// ============================================
// DEBT OPTIMIZER ENDPOINTS
// ============================================

/**
 * POST /api/smart/debt-strategy
 * Compare debt payoff strategies
 */
router.post('/debt-strategy', async (req, res) => {
    try {
        const userId = req.user.id;
        const { extraPayment = 0 } = req.body;

        // Get user's debts
        const debtsResult = await db.query(
            `SELECT id, title, remaining_amount, interest_rate, installments_total, installments_paid
       FROM debts
       WHERE user_id = $1 AND remaining_amount > 0`,
            [userId]
        );

        if (debtsResult.rows.length === 0) {
            return res.json({ message: 'No active debts found' });
        }

        const comparison = debtOptimizer.compareStrategies(debtsResult.rows, extraPayment);
        res.json(comparison);
    } catch (error) {
        console.error('Error calculating debt strategy:', error);
        res.status(500).json({ error: 'Failed to calculate debt strategy' });
    }
});

/**
 * POST /api/smart/debt-strategy/suggest-payment
 * Suggest extra payment amount
 */
router.post('/debt-strategy/suggest-payment', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current balance
        const balanceResult = await db.query(
            `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END), 0) as balance
       FROM transactions
       WHERE user_id = $1`,
            [userId]
        );

        // Get monthly recurring expenses
        const recurringResult = await db.query(
            `SELECT SUM(ABS(amount_avg)) as total
       FROM recurring_transactions
       WHERE user_id = $1 AND is_active = true AND amount_avg < 0`,
            [userId]
        );

        const currentBalance = parseFloat(balanceResult.rows[0]?.balance || 0);
        const monthlyExpenses = parseFloat(recurringResult.rows[0]?.total || 0);

        const suggestion = debtOptimizer.suggestExtraPayment(currentBalance, monthlyExpenses);
        res.json(suggestion);
    } catch (error) {
        console.error('Error suggesting payment:', error);
        res.status(500).json({ error: 'Failed to suggest payment' });
    }
});

// ============================================
// TASK INTELLIGENCE ENDPOINTS
// ============================================

/**
 * GET /api/smart/focus-tasks
 * Get top priority tasks for Focus Mode
 */
router.get('/focus-tasks', async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 3 } = req.query;

        const tasksResult = await db.query(
            `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const focusTasks = taskIntelligence.getFocusTasks(tasksResult.rows, parseInt(limit));
        res.json(focusTasks);
    } catch (error) {
        console.error('Error getting focus tasks:', error);
        res.status(500).json({ error: 'Failed to get focus tasks' });
    }
});

/**
 * GET /api/smart/task-patterns
 * Detect recurring task patterns
 */
router.get('/task-patterns', async (req, res) => {
    try {
        const userId = req.user.id;

        const tasksResult = await db.query(
            `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const patterns = taskIntelligence.detectRecurringTasks(tasksResult.rows);
        res.json(patterns);
    } catch (error) {
        console.error('Error detecting task patterns:', error);
        res.status(500).json({ error: 'Failed to detect task patterns' });
    }
});

/**
 * GET /api/smart/task-analytics
 * Get task analytics (overcommitment, velocity)
 */
router.get('/task-analytics', async (req, res) => {
    try {
        const userId = req.user.id;

        const tasksResult = await db.query(
            `SELECT * FROM tasks WHERE user_id = $1`,
            [userId]
        );

        const completedTasks = tasksResult.rows.filter(t => t.status === 'done');

        const overcommitment = taskIntelligence.checkOvercommitment(tasksResult.rows);
        const velocity = taskIntelligence.calculateVelocity(completedTasks);

        res.json({ overcommitment, velocity });
    } catch (error) {
        console.error('Error getting task analytics:', error);
        res.status(500).json({ error: 'Failed to get task analytics' });
    }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /api/smart/insights
 * Get spending insights and trends
 */
router.get('/insights', async (req, res) => {
    try {
        const userId = req.user.id;
        const { months = 3 } = req.query;

        const trends = await analytics.analyzeCategoryTrends(db, userId, parseInt(months));
        const anomalies = await analytics.detectAnomalies(db, userId);
        const duplicates = await analytics.detectDuplicates(db, userId);

        res.json({ trends, anomalies, duplicates });
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ error: 'Failed to get insights' });
    }
});

/**
 * GET /api/smart/health-score
 * Get financial health score
 */
router.get('/health-score', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current balance
        const balanceResult = await db.query(
            `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END), 0) as balance
       FROM transactions
       WHERE user_id = $1`,
            [userId]
        );

        const currentBalance = parseFloat(balanceResult.rows[0]?.balance || 0);
        const healthScore = await analytics.calculateHealthScore(db, userId, currentBalance);

        res.json(healthScore);
    } catch (error) {
        console.error('Error calculating health score:', error);
        res.status(500).json({ error: 'Failed to calculate health score' });
    }
});

module.exports = router;
