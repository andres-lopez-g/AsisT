/**
 * Recurring Transaction Detection Service
 * Detects patterns in transactions to identify recurring income/expenses
 */

import { parseISO, addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';

/**
 * Detect recurring transactions for a user
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of detected recurring transactions
 */
async function detectRecurring(db, userId) {
    // Get all transactions for the user, grouped by similar title and amount
    const transactions = await db.query(
        `SELECT id, title, amount, type, date, category
     FROM transactions
     WHERE user_id = $1
     ORDER BY date DESC`,
        [userId]
    );

    const recurring = [];
    const processed = new Set();

    // Group transactions by similar merchant/title
    for (let i = 0; i < transactions.rows.length; i++) {
        if (processed.has(transactions.rows[i].id)) continue;

        const base = transactions.rows[i];
        const similar = [];

        // Find similar transactions (same merchant, similar amount)
        for (let j = i + 1; j < transactions.rows.length; j++) {
            const compare = transactions.rows[j];

            if (processed.has(compare.id)) continue;

            // Check if titles are similar (fuzzy match)
            if (isSimilarMerchant(base.title, compare.title)) {
                // Check if amounts are similar (within 10%)
                const amountDiff = Math.abs(parseFloat(base.amount) - parseFloat(compare.amount));
                const avgAmount = (parseFloat(base.amount) + parseFloat(compare.amount)) / 2;

                if (amountDiff / avgAmount <= 0.10) {
                    similar.push(compare);
                    processed.add(compare.id);
                }
            }
        }

        // If we found 3+ similar transactions, it's likely recurring
        if (similar.length >= 2) {
            similar.unshift(base);
            processed.add(base.id);

            // Analyze frequency
            const frequency = detectFrequency(similar);

            if (frequency) {
                const amounts = similar.map(t => parseFloat(t.amount));
                const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
                const variance = Math.max(...amounts) - Math.min(...amounts);

                recurring.push({
                    merchant_pattern: extractMerchant(base.title),
                    amount_avg: avgAmount,
                    amount_variance: variance,
                    frequency: frequency.type,
                    next_expected_date: frequency.nextDate,
                    category: base.category,
                    sample_transactions: similar.slice(0, 3).map(t => ({
                        id: t.id,
                        title: t.title,
                        amount: t.amount,
                        date: t.date
                    }))
                });
            }
        }
    }

    return recurring;
}

/**
 * Check if two merchant names are similar
 */
function isSimilarMerchant(title1, title2) {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n1 = normalize(title1);
    const n2 = normalize(title2);

    // Check if one contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Check first 5 characters match
    if (n1.substring(0, 5) === n2.substring(0, 5)) return true;

    return false;
}

/**
 * Extract merchant name from transaction title
 */
function extractMerchant(title) {
    // Take first 2-3 words, remove numbers and special chars
    return title
        .split(/\s+/)
        .slice(0, 3)
        .join(' ')
        .replace(/[0-9#*]/g, '')
        .trim();
}

/**
 * Detect frequency pattern from transaction dates
 */
function detectFrequency(transactions) {
    if (transactions.length < 3) return null;

    // Sort by date
    const sorted = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
        const days = differenceInDays(
            parseISO(sorted[i].date),
            parseISO(sorted[i - 1].date)
        );
        intervals.push(days);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Determine frequency type
    let type, nextDate;
    const lastDate = parseISO(sorted[sorted.length - 1].date);

    if (avgInterval >= 6 && avgInterval <= 8) {
        type = 'weekly';
        nextDate = addWeeks(lastDate, 1);
    } else if (avgInterval >= 13 && avgInterval <= 15) {
        type = 'biweekly';
        nextDate = addWeeks(lastDate, 2);
    } else if (avgInterval >= 28 && avgInterval <= 32) {
        type = 'monthly';
        nextDate = addMonths(lastDate, 1);
    } else if (avgInterval >= 88 && avgInterval <= 95) {
        type = 'quarterly';
        nextDate = addMonths(lastDate, 3);
    } else {
        return null; // Irregular pattern
    }

    return { type, nextDate: nextDate.toISOString().split('T')[0] };
}

/**
 * Save detected recurring transactions to database
 */
async function saveRecurring(db, userId, recurringList) {
    for (const recurring of recurringList) {
        await db.query(
            `INSERT INTO recurring_transactions 
       (user_id, merchant_pattern, amount_avg, amount_variance, frequency, next_expected_date, category, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (user_id, merchant_pattern) DO UPDATE SET
         amount_avg = $3,
         amount_variance = $4,
         frequency = $5,
         next_expected_date = $6,
         category = $7`,
            [
                userId,
                recurring.merchant_pattern,
                recurring.amount_avg,
                recurring.amount_variance,
                recurring.frequency,
                recurring.next_expected_date,
                recurring.category
            ]
        );
    }
}

/**
 * Get all recurring transactions for a user
 */
async function getRecurring(db, userId) {
    const result = await db.query(
        `SELECT * FROM recurring_transactions
     WHERE user_id = $1
     ORDER BY next_expected_date ASC`,
        [userId]
    );

    return result.rows;
}

/**
 * Toggle recurring transaction active status
 */
async function toggleRecurring(db, userId, recurringId, isActive) {
    await db.query(
        `UPDATE recurring_transactions
     SET is_active = $3
     WHERE id = $1 AND user_id = $2`,
        [recurringId, userId, isActive]
    );
}

/**
 * Delete recurring transaction
 */
async function deleteRecurring(db, userId, recurringId) {
    await db.query(
        `DELETE FROM recurring_transactions
     WHERE id = $1 AND user_id = $2`,
        [recurringId, userId]
    );
}

export {
    detectRecurring,
    saveRecurring,
    getRecurring,
    toggleRecurring,
    deleteRecurring
};
