/**
 * Currency utility functions for the frontend
 */

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
export function formatCurrency(amount, currency = 'USD') {
    const symbol = getCurrencySymbol(currency);
    
    if (currency === 'COP') {
        // COP typically doesn't use decimals and uses space before currency code
        return `${symbol}${Math.round(amount).toLocaleString()} COP`;
    }
    
    const formatted = parseFloat(amount).toFixed(2);
    return `${symbol}${formatted}`;
}

/**
 * Get all supported currencies
 * @returns {Array} - Array of currency objects with code and name
 */
export function getSupportedCurrencies() {
    return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'COP', name: 'Colombian Peso', symbol: '$' }
    ];
}
