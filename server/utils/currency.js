/**
 * Currency Utility Functions
 * Handles currency conversion and formatting for multi-currency support
 */

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'COP'];

/**
 * Get exchange rate between two currencies
 * @param {object} db - Database connection
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} - Exchange rate
 */
export async function getExchangeRate(db, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return 1.0;
    }

    try {
        const result = await db.query(
            'SELECT rate FROM exchange_rates WHERE from_currency = $1 AND to_currency = $2',
            [fromCurrency, toCurrency]
        );

        if (result.rows.length === 0) {
            throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }

        return parseFloat(result.rows[0].rate);
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw error;
    }
}

/**
 * Convert amount from one currency to another
 * @param {object} db - Database connection
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} - Converted amount
 */
export async function convertCurrency(db, amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return parseFloat(amount);
    }

    const rate = await getExchangeRate(db, fromCurrency, toCurrency);
    return parseFloat(amount) * rate;
}

/**
 * Get currency symbol for a currency code
 * @param {string} currency - Currency code
 * @returns {string} - Currency symbol
 */
export function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'COP': '$'
    };
    return symbols[currency] || currency;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount with symbol
 */
export function formatCurrency(amount, currency) {
    const symbol = getCurrencySymbol(currency);
    const formatted = parseFloat(amount).toFixed(2);
    
    if (currency === 'COP') {
        // COP typically doesn't use decimals and symbol goes after
        return `${Math.round(amount)} ${currency}`;
    }
    
    return `${symbol}${formatted}`;
}

/**
 * Get all exchange rates
 * @param {object} db - Database connection
 * @returns {Promise<Array>} - All exchange rates
 */
export async function getAllExchangeRates(db) {
    try {
        const result = await db.query('SELECT * FROM exchange_rates ORDER BY from_currency, to_currency');
        return result.rows;
    } catch (error) {
        console.error('Error fetching all exchange rates:', error);
        throw error;
    }
}

/**
 * Validate currency code
 * @param {string} currency - Currency code to validate
 * @returns {boolean} - True if valid
 */
export function isValidCurrency(currency) {
    return SUPPORTED_CURRENCIES.includes(currency);
}
