import express from 'express';
import db from '../db.js';
import authenticate from '../middleware/auth.js';
import * as geminiService from '../services/geminiService.js';

const router = express.Router();

/**
 * Gemini Bot API Routes
 * Provides AI-powered assistance and recommendations
 */

/**
 * GET /api/gemini/status
 * Check if Gemini API is available
 */
router.get('/status', (req, res) => {
    const available = geminiService.isAvailable();
    res.json({ 
        available,
        message: available ? 'Gemini API is ready' : 'Gemini API not configured'
    });
});

/**
 * POST /api/gemini/chat
 * Chat with AI assistant
 */
router.post('/chat', authenticate, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get user context
        const userContext = await getUserContext(userId);
        
        // Generate AI response
        const aiResponse = await geminiService.generateResponse(message, userContext);
        
        // Store conversation in database (optional - for history)
        await db.query(
            `INSERT INTO bot_conversations (user_id, user_message, bot_response) 
             VALUES ($1, $2, $3)`,
            [userId, message, aiResponse.response]
        );
        
        res.json(aiResponse);
    } catch (error) {
        console.error('[Gemini Bot] Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            message: error.message 
        });
    }
});

/**
 * GET /api/gemini/recommendations/financial
 * Get financial recommendations
 */
router.get('/recommendations/financial', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get financial data
        const financialData = await getFinancialSummary(userId);
        
        // Generate recommendations
        const recommendations = await geminiService.getFinancialRecommendations(financialData);
        
        res.json(recommendations);
    } catch (error) {
        console.error('[Gemini Bot] Financial recommendations error:', error);
        res.status(500).json({ 
            error: 'Failed to generate recommendations',
            message: error.message 
        });
    }
});

/**
 * GET /api/gemini/recommendations/productivity
 * Get productivity tips
 */
router.get('/recommendations/productivity', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get task data
        const taskData = await getTaskSummary(userId);
        
        // Generate tips
        const tips = await geminiService.getProductivityTips(taskData);
        
        res.json(tips);
    } catch (error) {
        console.error('[Gemini Bot] Productivity tips error:', error);
        res.status(500).json({ 
            error: 'Failed to generate tips',
            message: error.message 
        });
    }
});

/**
 * GET /api/gemini/history
 * Get conversation history
 */
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;
        
        const result = await db.query(
            `SELECT id, user_message, bot_response, created_at 
             FROM bot_conversations 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, parseInt(limit)]
        );
        
        res.json({ conversations: result.rows.reverse() });
    } catch (error) {
        console.error('[Gemini Bot] History error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});

/**
 * Helper: Get user context for AI
 */
async function getUserContext(userId) {
    try {
        // Get financial summary
        const balanceResult = await db.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END), 0) as balance,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END), 0) as total_expenses
             FROM transactions
             WHERE user_id = $1`,
            [userId]
        );
        
        // Get task summary
        const taskResult = await db.query(
            `SELECT 
                COUNT(*) as total_tasks,
                COUNT(*) FILTER (WHERE status = 'todo') as pending_tasks,
                COUNT(*) FILTER (WHERE status = 'done') as completed_tasks
             FROM tasks
             WHERE user_id = $1`,
            [userId]
        );
        
        const balance = parseFloat(balanceResult.rows[0]?.balance || 0);
        const totalIncome = parseFloat(balanceResult.rows[0]?.total_income || 0);
        const totalExpenses = parseFloat(balanceResult.rows[0]?.total_expenses || 0);
        const pendingTasks = parseInt(taskResult.rows[0]?.pending_tasks || 0);
        const completedTasks = parseInt(taskResult.rows[0]?.completed_tasks || 0);
        
        return {
            balance,
            totalIncome,
            totalExpenses,
            pendingTasks,
            completedTasks
        };
    } catch (error) {
        console.error('[Gemini Bot] Error getting user context:', error);
        return {};
    }
}

/**
 * Helper: Get financial summary
 */
async function getFinancialSummary(userId) {
    try {
        // Get balance
        const balanceResult = await db.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END), 0) as balance,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END), 0) as total_expenses
             FROM transactions
             WHERE user_id = $1`,
            [userId]
        );
        
        // Get debts
        const debtResult = await db.query(
            `SELECT COALESCE(SUM(remaining_amount), 0) as total_debts
             FROM debts
             WHERE user_id = $1`,
            [userId]
        );
        
        // Get recurring transactions
        const recurringResult = await db.query(
            `SELECT COUNT(*) as recurring_count
             FROM recurring_transactions
             WHERE user_id = $1 AND is_active = true`,
            [userId]
        );
        
        // Get spending by category
        const categoryResult = await db.query(
            `SELECT c.name, COALESCE(SUM(ABS(t.amount)), 0) as amount
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = $1 AND t.type = 'expense'
             GROUP BY c.name
             ORDER BY amount DESC
             LIMIT 5`,
            [userId]
        );
        
        return {
            balance: parseFloat(balanceResult.rows[0]?.balance || 0),
            totalIncome: parseFloat(balanceResult.rows[0]?.total_income || 0),
            totalExpenses: parseFloat(balanceResult.rows[0]?.total_expenses || 0),
            totalDebts: parseFloat(debtResult.rows[0]?.total_debts || 0),
            recurringCount: parseInt(recurringResult.rows[0]?.recurring_count || 0),
            categories: categoryResult.rows
        };
    } catch (error) {
        console.error('[Gemini Bot] Error getting financial summary:', error);
        return {};
    }
}

/**
 * Helper: Get task summary
 */
async function getTaskSummary(userId) {
    try {
        const result = await db.query(
            `SELECT 
                COUNT(*) as total_tasks,
                COUNT(*) FILTER (WHERE status = 'todo') as pending_tasks,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
                COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
                COUNT(*) FILTER (WHERE priority = 'high' AND status != 'done') as high_priority_tasks
             FROM tasks
             WHERE user_id = $1`,
            [userId]
        );
        
        const data = result.rows[0] || {};
        const totalTasks = parseInt(data.total_tasks || 0);
        const pendingTasks = parseInt(data.pending_tasks || 0);
        const inProgressTasks = parseInt(data.in_progress_tasks || 0);
        
        return {
            totalTasks,
            pendingTasks: parseInt(data.pending_tasks || 0),
            inProgressTasks: parseInt(data.in_progress_tasks || 0),
            completedTasks: parseInt(data.completed_tasks || 0),
            highPriorityTasks: parseInt(data.high_priority_tasks || 0),
            overcommitment: (pendingTasks + inProgressTasks) > totalTasks * 0.7
        };
    } catch (error) {
        console.error('[Gemini Bot] Error getting task summary:', error);
        return {};
    }
}

export default router;
