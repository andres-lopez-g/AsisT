/**
 * Balance Forecasting Service
 * Predicts future balance using recurring transactions and spending patterns
 */

import { addDays, addWeeks, addMonths, parseISO, format } from 'date-fns';

/**
 * Generate balance forecast for 30/60/90 days
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} currentBalance - Current account balance
 * @param {number} days - Number of days to forecast (default 90)
 * @returns {Promise<Object>} Forecast data with projections and alerts
 */
async function generateForecast(db, userId, currentBalance, days = 90) {
    // Get user's forecast settings
    const settings = await getForecastSettings(db, userId);

    // Get recurring transactions
    const recurring = await db.query(
        `SELECT * FROM recurring_transactions
     WHERE user_id = $1 AND is_active = true`,
        [userId]
    );

    // Get historical variable spending (non-recurring)
    const variableSpending = await getVariableSpending(db, userId);

    // Generate daily projections
    const projections = [];
    let balance = parseFloat(currentBalance);
    const today = new Date();

    for (let i = 0; i <= days; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Check for recurring transactions on this date
        let dailyIncome = 0;
        let dailyExpenses = 0;

        for (const rec of recurring.rows) {
            if (isRecurringDue(rec, date)) {
                if (rec.amount_avg > 0) {
                    dailyIncome += parseFloat(rec.amount_avg);
                } else {
                    dailyExpenses += Math.abs(parseFloat(rec.amount_avg));
                }
            }
        }

        // Add average variable spending if enabled
        if (settings.include_variable_spending) {
            dailyExpenses += variableSpending.avgDailyExpense;
        }

        // Calculate balance
        balance = balance + dailyIncome - dailyExpenses;

        projections.push({
            date: dateStr,
            balance: Math.round(balance * 100) / 100,
            income: dailyIncome,
            expenses: dailyExpenses,
            isRecurringDay: dailyIncome > 0 || dailyExpenses > 0
        });
    }

    // Generate alerts
    const alerts = generateAlerts(projections, settings);

    // Calculate confidence bands (optimistic/pessimistic)
    const optimistic = projections.map(p => ({
        ...p,
        balance: p.balance + (variableSpending.avgDailyExpense * 0.3) // 30% less spending
    }));

    const pessimistic = projections.map(p => ({
        ...p,
        balance: p.balance - (variableSpending.avgDailyExpense * 0.3) // 30% more spending
    }));

    return {
        projections,
        optimistic,
        pessimistic,
        alerts,
        summary: {
            currentBalance,
            projected30Day: projections[30]?.balance || 0,
            projected60Day: projections[60]?.balance || 0,
            projected90Day: projections[90]?.balance || 0,
            avgDailyIncome: calculateAvgIncome(recurring.rows),
            avgDailyExpenses: calculateAvgExpenses(recurring.rows) + variableSpending.avgDailyExpense
        }
    };
}

/**
 * Check if recurring transaction is due on a specific date
 */
function isRecurringDue(recurring, checkDate) {
    const nextDate = parseISO(recurring.next_expected_date);
    const check = parseISO(format(checkDate, 'yyyy-MM-dd'));

    if (check < nextDate) return false;

    // Calculate if this date matches the recurrence pattern
    const daysDiff = Math.floor((check - nextDate) / (1000 * 60 * 60 * 24));

    switch (recurring.frequency) {
        case 'weekly':
            return daysDiff % 7 === 0;
        case 'biweekly':
            return daysDiff % 14 === 0;
        case 'monthly':
            return check.getDate() === nextDate.getDate();
        case 'quarterly':
            return check.getDate() === nextDate.getDate() && (check.getMonth() - nextDate.getMonth()) % 3 === 0;
        default:
            return false;
    }
}

/**
 * Get average variable (non-recurring) spending
 */
async function getVariableSpending(db, userId) {
    const result = await db.query(
        `SELECT AVG(ABS(amount)) as avg_expense
     FROM transactions
     WHERE user_id = $1 
       AND type = 'expense'
       AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [userId]
    );

    const avgMonthlyExpense = parseFloat(result.rows[0]?.avg_expense || 0);
    const avgDailyExpense = avgMonthlyExpense / 30;

    return { avgDailyExpense, avgMonthlyExpense };
}

/**
 * Calculate average daily income from recurring transactions
 */
function calculateAvgIncome(recurringList) {
    const monthlyIncome = recurringList
        .filter(r => parseFloat(r.amount_avg) > 0)
        .reduce((sum, r) => {
            const amount = parseFloat(r.amount_avg);
            switch (r.frequency) {
                case 'weekly': return sum + (amount * 4.33);
                case 'biweekly': return sum + (amount * 2.17);
                case 'monthly': return sum + amount;
                case 'quarterly': return sum + (amount / 3);
                default: return sum;
            }
        }, 0);

    return monthlyIncome / 30;
}

/**
 * Calculate average daily expenses from recurring transactions
 */
function calculateAvgExpenses(recurringList) {
    const monthlyExpenses = recurringList
        .filter(r => parseFloat(r.amount_avg) < 0)
        .reduce((sum, r) => {
            const amount = Math.abs(parseFloat(r.amount_avg));
            switch (r.frequency) {
                case 'weekly': return sum + (amount * 4.33);
                case 'biweekly': return sum + (amount * 2.17);
                case 'monthly': return sum + amount;
                case 'quarterly': return sum + (amount / 3);
                default: return sum;
            }
        }, 0);

    return monthlyExpenses / 30;
}

/**
 * Generate alerts based on forecast
 */
function generateAlerts(projections, settings) {
    const alerts = [];
    const threshold = parseFloat(settings.low_balance_threshold);
    const alertDays = settings.alert_days_ahead;

    // Check for low balance warnings
    for (let i = 0; i < Math.min(alertDays, projections.length); i++) {
        const proj = projections[i];
        if (proj.balance < threshold) {
            alerts.push({
                type: 'low_balance',
                severity: 'warning',
                date: proj.date,
                message: `Balance projected to drop to $${proj.balance.toFixed(2)} on ${proj.date}`,
                balance: proj.balance
            });
            break; // Only show first occurrence
        }
    }

    // Check for surplus opportunities (balance significantly higher than usual)
    const avgBalance = projections.slice(0, 30).reduce((sum, p) => sum + p.balance, 0) / 30;
    const surplusThreshold = avgBalance * 1.2;

    for (let i = 0; i < Math.min(7, projections.length); i++) {
        const proj = projections[i];
        if (proj.balance > surplusThreshold) {
            alerts.push({
                type: 'surplus',
                severity: 'info',
                date: proj.date,
                message: `Surplus of $${(proj.balance - avgBalance).toFixed(2)} projected on ${proj.date}`,
                amount: proj.balance - avgBalance
            });
            break;
        }
    }

    return alerts;
}

/**
 * Get or create forecast settings for user
 */
async function getForecastSettings(db, userId) {
    let result = await db.query(
        `SELECT * FROM forecast_settings WHERE user_id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        // Create default settings
        await db.query(
            `INSERT INTO forecast_settings (user_id) VALUES ($1)`,
            [userId]
        );

        result = await db.query(
            `SELECT * FROM forecast_settings WHERE user_id = $1`,
            [userId]
        );
    }

    return result.rows[0];
}

/**
 * Update forecast settings
 */
async function updateForecastSettings(db, userId, settings) {
    await db.query(
        `UPDATE forecast_settings
     SET low_balance_threshold = $2,
         alert_days_ahead = $3,
         include_variable_spending = $4
     WHERE user_id = $1`,
        [
            userId,
            settings.low_balance_threshold,
            settings.alert_days_ahead,
            settings.include_variable_spending
        ]
    );
}

export {
    generateForecast,
    getForecastSettings,
    updateForecastSettings
};
