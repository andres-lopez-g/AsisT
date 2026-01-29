/**
 * Analytics Service
 * Provides spending pattern analysis, anomaly detection, and financial health scoring
 */

/**
 * Analyze spending trends by category (month-over-month)
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} months - Number of months to analyze (default 3)
 * @returns {Promise<Object>} Category trends with MoM comparison
 */
async function analyzeCategoryTrends(db, userId, months = 3) {
    const trends = [];

    // Get transactions for the last N months, grouped by category and month
    const result = await db.query(
        `SELECT 
       category,
       DATE_TRUNC('month', date) as month,
       SUM(ABS(amount)) as total,
       COUNT(*) as count
     FROM transactions
     WHERE user_id = $1 
       AND type = 'expense'
       AND date >= CURRENT_DATE - INTERVAL '${months} months'
       AND category IS NOT NULL
     GROUP BY category, DATE_TRUNC('month', date)
     ORDER BY category, month DESC`,
        [userId]
    );

    // Group by category
    const byCategory = {};
    for (const row of result.rows) {
        if (!byCategory[row.category]) {
            byCategory[row.category] = [];
        }
        byCategory[row.category].push({
            month: row.month,
            total: parseFloat(row.total),
            count: parseInt(row.count)
        });
    }

    // Calculate trends
    for (const [category, data] of Object.entries(byCategory)) {
        if (data.length < 2) continue;

        const current = data[0];
        const previous = data[1];
        const change = current.total - previous.total;
        const percentChange = (change / previous.total) * 100;

        trends.push({
            category,
            currentMonth: current.total,
            previousMonth: previous.total,
            change,
            percentChange: Math.round(percentChange * 10) / 10,
            trend: percentChange > 10 ? 'increasing' : percentChange < -10 ? 'decreasing' : 'stable',
            transactionCount: current.count
        });
    }

    return trends.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
}

/**
 * Detect anomalous transactions (unusual spending)
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} days - Days to look back (default 30)
 * @returns {Promise<Array>} List of anomalous transactions
 */
async function detectAnomalies(db, userId, days = 30) {
    const anomalies = [];

    // Get category averages
    const avgResult = await db.query(
        `SELECT 
       category,
       AVG(ABS(amount)) as avg_amount,
       STDDEV(ABS(amount)) as stddev_amount
     FROM transactions
     WHERE user_id = $1 
       AND type = 'expense'
       AND date >= CURRENT_DATE - INTERVAL '90 days'
       AND category IS NOT NULL
     GROUP BY category`,
        [userId]
    );

    const categoryStats = {};
    for (const row of avgResult.rows) {
        categoryStats[row.category] = {
            avg: parseFloat(row.avg_amount),
            stddev: parseFloat(row.stddev_amount) || 0
        };
    }

    // Get recent transactions
    const recentResult = await db.query(
        `SELECT id, title, amount, category, date
     FROM transactions
     WHERE user_id = $1 
       AND type = 'expense'
       AND date >= CURRENT_DATE - INTERVAL '${days} days'
       AND category IS NOT NULL
     ORDER BY date DESC`,
        [userId]
    );

    // Check each transaction against category average
    for (const tx of recentResult.rows) {
        const stats = categoryStats[tx.category];
        if (!stats) continue;

        const amount = Math.abs(parseFloat(tx.amount));
        const threshold = stats.avg + (stats.stddev * 2); // 2 standard deviations

        if (amount > threshold && amount > stats.avg * 1.5) {
            const percentAboveAvg = ((amount - stats.avg) / stats.avg) * 100;

            anomalies.push({
                transaction: {
                    id: tx.id,
                    title: tx.title,
                    amount: amount,
                    category: tx.category,
                    date: tx.date
                },
                categoryAvg: Math.round(stats.avg * 100) / 100,
                percentAboveAvg: Math.round(percentAboveAvg),
                severity: amount > stats.avg * 3 ? 'high' : amount > stats.avg * 2 ? 'medium' : 'low',
                message: `$${amount.toFixed(2)} is ${percentAboveAvg.toFixed(0)}% above your average ${tx.category} expense`
            });
        }
    }

    return anomalies;
}

/**
 * Detect potential duplicate transactions
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} days - Days to look back (default 7)
 * @returns {Promise<Array>} Potential duplicates
 */
async function detectDuplicates(db, userId, days = 7) {
    const result = await db.query(
        `SELECT id, title, amount, date, category
     FROM transactions
     WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '${days} days'
     ORDER BY date DESC, title`,
        [userId]
    );

    const duplicates = [];
    const seen = new Map();

    for (const tx of result.rows) {
        const key = `${tx.title.toLowerCase()}_${tx.amount}_${tx.date}`;

        if (seen.has(key)) {
            duplicates.push({
                transaction1: seen.get(key),
                transaction2: tx,
                confidence: 'high',
                message: 'Identical title, amount, and date'
            });
        } else {
            seen.set(key, tx);
        }
    }

    return duplicates;
}

/**
 * Calculate financial health score (0-100)
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} currentBalance - Current account balance
 * @returns {Promise<Object>} Health score with breakdown
 */
async function calculateHealthScore(db, userId, currentBalance) {
    let score = 0;
    const breakdown = {};

    // 1. Savings Rate (0-25 points)
    const incomeResult = await db.query(
        `SELECT SUM(amount) as total
     FROM transactions
     WHERE user_id = $1 
       AND type = 'income'
       AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [userId]
    );

    const expenseResult = await db.query(
        `SELECT SUM(ABS(amount)) as total
     FROM transactions
     WHERE user_id = $1 
       AND type = 'expense'
       AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [userId]
    );

    const income = parseFloat(incomeResult.rows[0]?.total || 0);
    const expenses = parseFloat(expenseResult.rows[0]?.total || 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 15;
    else if (savingsRate >= 0) score += 10;

    breakdown.savingsRate = {
        value: Math.round(savingsRate * 10) / 10,
        score: Math.min(25, Math.round(savingsRate * 1.25)),
        max: 25
    };

    // 2. Debt Progress (0-25 points)
    const debtResult = await db.query(
        `SELECT 
       SUM(total_amount) as total_debt,
       SUM(remaining_amount) as remaining_debt
     FROM debts
     WHERE user_id = $1`,
        [userId]
    );

    const totalDebt = parseFloat(debtResult.rows[0]?.total_debt || 0);
    const remainingDebt = parseFloat(debtResult.rows[0]?.remaining_debt || 0);

    let debtScore = 0;
    if (totalDebt === 0) {
        debtScore = 25; // No debt
    } else {
        const paidOff = ((totalDebt - remainingDebt) / totalDebt) * 100;
        debtScore = Math.round(paidOff * 0.25);
    }
    score += debtScore;

    breakdown.debtProgress = {
        value: totalDebt > 0 ? Math.round(((totalDebt - remainingDebt) / totalDebt) * 100) : 100,
        score: debtScore,
        max: 25
    };

    // 3. Budget Adherence (0-25 points)
    // Simple version: compare spending to income
    const adherence = income > 0 ? Math.min(100, (1 - (expenses / income)) * 100) : 0;
    const adherenceScore = Math.max(0, Math.round(adherence * 0.25));
    score += adherenceScore;

    breakdown.budgetAdherence = {
        value: Math.round(adherence),
        score: adherenceScore,
        max: 25
    };

    // 4. Emergency Fund (0-25 points)
    // Based on months of expenses covered by current balance
    const monthlyExpenses = expenses;
    const monthsCovered = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : 0;

    let emergencyScore = 0;
    if (monthsCovered >= 6) emergencyScore = 25;
    else if (monthsCovered >= 3) emergencyScore = 20;
    else if (monthsCovered >= 1) emergencyScore = 15;
    else if (monthsCovered >= 0.5) emergencyScore = 10;
    else emergencyScore = 5;

    score += emergencyScore;

    breakdown.emergencyFund = {
        value: Math.round(monthsCovered * 10) / 10,
        score: emergencyScore,
        max: 25
    };

    return {
        score: Math.min(100, score),
        grade: getGrade(score),
        breakdown,
        suggestions: generateSuggestions(breakdown)
    };
}

/**
 * Convert score to letter grade
 */
function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

/**
 * Generate improvement suggestions based on breakdown
 */
function generateSuggestions(breakdown) {
    const suggestions = [];

    if (breakdown.savingsRate.value < 10) {
        suggestions.push({
            category: 'Savings',
            priority: 'high',
            message: 'Aim to save at least 10% of your income each month'
        });
    }

    if (breakdown.debtProgress.value < 50 && breakdown.debtProgress.value > 0) {
        suggestions.push({
            category: 'Debt',
            priority: 'high',
            message: 'Focus on paying down debt using avalanche or snowball method'
        });
    }

    if (breakdown.emergencyFund.value < 3) {
        suggestions.push({
            category: 'Emergency Fund',
            priority: 'high',
            message: 'Build an emergency fund covering 3-6 months of expenses'
        });
    }

    if (breakdown.budgetAdherence.value < 70) {
        suggestions.push({
            category: 'Budget',
            priority: 'medium',
            message: 'Review your spending categories and identify areas to cut back'
        });
    }

    return suggestions;
}

module.exports = {
    analyzeCategoryTrends,
    detectAnomalies,
    detectDuplicates,
    calculateHealthScore
};
