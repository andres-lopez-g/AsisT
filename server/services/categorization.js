/**
 * Smart Categorization Service
 * Provides intelligent transaction categorization using pattern matching and user learning
 */

// Built-in merchant patterns (common merchants → categories)
const DEFAULT_PATTERNS = {
    // Groceries
    'walmart|target|costco|kroger|safeway|whole foods|trader joe': 'Groceries',
    'albertsons|publix|aldi|food lion|wegmans|heb': 'Groceries',

    // Transportation
    'shell|chevron|exxon|bp|mobil|arco|citgo|valero': 'Transportation',
    'uber|lyft|taxi|metro|transit|parking': 'Transportation',

    // Subscriptions
    'netflix|hulu|disney|spotify|apple music|youtube premium': 'Subscriptions',
    'amazon prime|hbo|paramount|peacock': 'Subscriptions',

    // Dining
    'mcdonald|burger king|wendy|taco bell|kfc|subway|chipotle': 'Dining',
    'starbucks|dunkin|coffee|restaurant|cafe|pizza': 'Dining',

    // Utilities
    'electric|power|water|gas|internet|phone|cable': 'Utilities',
    'verizon|at&t|t-mobile|comcast|spectrum': 'Utilities',

    // Shopping
    'amazon|ebay|etsy|best buy|home depot|lowe': 'Shopping',

    // Healthcare
    'pharmacy|cvs|walgreens|rite aid|doctor|hospital|clinic': 'Healthcare',

    // Entertainment
    'cinema|movie|theater|concert|gym|fitness': 'Entertainment'
};

/**
 * Suggest category for a transaction based on title
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {string} title - Transaction title
 * @returns {Promise<Object>} { category, confidence, source }
 */
async function suggestCategory(db, userId, title) {
    const titleLower = title.toLowerCase();

    // 1. Check user's learned patterns first (highest priority)
    const userRule = await db.query(
        `SELECT category, confidence, usage_count 
     FROM categorization_rules 
     WHERE user_id = $1 AND $2 ILIKE '%' || pattern || '%'
     ORDER BY usage_count DESC, confidence DESC
     LIMIT 1`,
        [userId, title]
    );

    if (userRule.rows.length > 0) {
        return {
            category: userRule.rows[0].category,
            confidence: parseFloat(userRule.rows[0].confidence),
            source: 'learned'
        };
    }

    // 2. Check default patterns
    for (const [pattern, category] of Object.entries(DEFAULT_PATTERNS)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(titleLower)) {
            return {
                category,
                confidence: 0.75, // Default patterns have lower confidence
                source: 'default'
            };
        }
    }

    // 3. No match found
    return {
        category: null,
        confidence: 0,
        source: 'none'
    };
}

/**
 * Learn from user's categorization choice
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {string} title - Transaction title
 * @param {string} category - User-selected category
 */
async function learnFromChoice(db, userId, title, category) {
    // Extract merchant name (first word or two)
    const merchant = title.toLowerCase().split(/\s+/).slice(0, 2).join(' ');

    // Upsert categorization rule
    await db.query(
        `INSERT INTO categorization_rules (user_id, pattern, category, confidence, usage_count)
     VALUES ($1, $2, $3, 0.90, 1)
     ON CONFLICT (user_id, pattern)
     DO UPDATE SET 
       usage_count = categorization_rules.usage_count + 1,
       confidence = LEAST(0.99, categorization_rules.confidence + 0.02),
       category = $3`,
        [userId, merchant, category]
    );
}

/**
 * Get all learned rules for a user
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of categorization rules
 */
async function getUserRules(db, userId) {
    const result = await db.query(
        `SELECT pattern, category, confidence, usage_count, created_at
     FROM categorization_rules
     WHERE user_id = $1
     ORDER BY usage_count DESC, confidence DESC`,
        [userId]
    );

    return result.rows;
}

/**
 * Delete a learned rule
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {string} pattern - Pattern to delete
 */
async function deleteRule(db, userId, pattern) {
    await db.query(
        `DELETE FROM categorization_rules
     WHERE user_id = $1 AND pattern = $2`,
        [userId, pattern]
    );
}

export {
    suggestCategory,
    learnFromChoice,
    getUserRules,
    deleteRule,
    DEFAULT_PATTERNS
};
