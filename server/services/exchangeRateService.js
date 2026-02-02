/**
 * Exchange Rate Service
 * Automatically fetches and updates currency exchange rates from a free API
 * Uses exchangerate-api.com (free tier: 1,500 requests/month)
 */

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'COP'];

/**
 * Fetch latest exchange rates from exchangerate-api.com
 * Free API - no key required for basic usage
 * @returns {Promise<Object>} - Exchange rates with USD as base
 */
export async function fetchLatestRates() {
    try {
        // Using exchangerate-api.com free API (no key required)
        const response = await fetch('https://open.exchangerate-api.com/v6/latest/USD');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.rates) {
            throw new Error('Invalid response format from exchange rate API');
        }
        
        console.log('[EXCHANGE] Successfully fetched exchange rates from API');
        return {
            rates: data.rates,
            timestamp: new Date(data.time_last_update_unix * 1000),
            base: 'USD'
        };
    } catch (error) {
        console.error('[EXCHANGE] Error fetching exchange rates:', error.message);
        throw error;
    }
}

/**
 * Calculate all bidirectional exchange rates for supported currencies
 * @param {Object} usdRates - Rates with USD as base
 * @returns {Array} - Array of rate objects
 */
function calculateAllRates(usdRates) {
    const rates = [];
    
    // Get rates from USD base
    const usdToEur = usdRates.EUR || 0.92;
    const usdToCop = usdRates.COP || 4000;
    
    // USD conversions
    rates.push({ from: 'USD', to: 'USD', rate: 1.0 });
    rates.push({ from: 'USD', to: 'EUR', rate: usdToEur });
    rates.push({ from: 'USD', to: 'COP', rate: usdToCop });
    
    // EUR conversions (inverse and cross rates)
    const eurToUsd = 1 / usdToEur;
    const eurToCop = usdToCop / usdToEur;
    rates.push({ from: 'EUR', to: 'USD', rate: eurToUsd });
    rates.push({ from: 'EUR', to: 'EUR', rate: 1.0 });
    rates.push({ from: 'EUR', to: 'COP', rate: eurToCop });
    
    // COP conversions (inverse and cross rates)
    const copToUsd = 1 / usdToCop;
    const copToEur = usdToEur / usdToCop;
    rates.push({ from: 'COP', to: 'USD', rate: copToUsd });
    rates.push({ from: 'COP', to: 'EUR', rate: copToEur });
    rates.push({ from: 'COP', to: 'COP', rate: 1.0 });
    
    return rates;
}

/**
 * Update exchange rates in database
 * @param {object} db - Database connection
 * @returns {Promise<Object>} - Update results
 */
export async function updateExchangeRates(db) {
    try {
        console.log('[EXCHANGE] Starting exchange rate update...');
        
        // Fetch latest rates from API
        const { rates: usdRates, timestamp } = await fetchLatestRates();
        
        // Calculate all bidirectional rates
        const allRates = calculateAllRates(usdRates);
        
        // Update database
        let updatedCount = 0;
        for (const { from, to, rate } of allRates) {
            const result = await db.query(
                `INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                 ON CONFLICT (from_currency, to_currency) 
                 DO UPDATE SET rate = $3, updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [from, to, rate]
            );
            
            if (result.rowCount > 0) {
                updatedCount++;
            }
        }
        
        console.log(`[EXCHANGE] Successfully updated ${updatedCount} exchange rates`);
        
        return {
            success: true,
            updatedCount,
            timestamp,
            rates: allRates
        };
    } catch (error) {
        console.error('[EXCHANGE] Error updating exchange rates:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if exchange rates need updating
 * @param {object} db - Database connection
 * @returns {Promise<boolean>} - True if rates are stale (>24 hours old)
 */
export async function shouldUpdateRates(db) {
    try {
        const result = await db.query(
            `SELECT MAX(updated_at) as last_update 
             FROM exchange_rates 
             WHERE from_currency = 'USD' AND to_currency != 'USD'`
        );
        
        if (result.rows.length === 0 || !result.rows[0].last_update) {
            console.log('[EXCHANGE] No rates found, update needed');
            return true;
        }
        
        const lastUpdate = new Date(result.rows[0].last_update);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        const needsUpdate = hoursSinceUpdate > 24;
        console.log(`[EXCHANGE] Last update: ${lastUpdate.toISOString()}, Hours ago: ${hoursSinceUpdate.toFixed(1)}, Needs update: ${needsUpdate}`);
        
        return needsUpdate;
    } catch (error) {
        console.error('[EXCHANGE] Error checking rate staleness:', error.message);
        return false;
    }
}

/**
 * Initialize automatic exchange rate updates
 * Checks and updates rates on startup, then every 24 hours
 * @param {object} db - Database connection
 */
export function initializeAutoUpdates(db) {
    console.log('[EXCHANGE] Initializing automatic exchange rate updates');
    
    // Check and update on startup
    setTimeout(async () => {
        try {
            const needsUpdate = await shouldUpdateRates(db);
            if (needsUpdate) {
                await updateExchangeRates(db);
            } else {
                console.log('[EXCHANGE] Rates are fresh, skipping update');
            }
        } catch (error) {
            console.error('[EXCHANGE] Error in startup rate check:', error.message);
        }
    }, 5000); // Wait 5 seconds after startup
    
    // Schedule daily updates (every 24 hours)
    setInterval(async () => {
        try {
            console.log('[EXCHANGE] Running scheduled rate update check');
            const needsUpdate = await shouldUpdateRates(db);
            if (needsUpdate) {
                await updateExchangeRates(db);
            }
        } catch (error) {
            console.error('[EXCHANGE] Error in scheduled rate update:', error.message);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('[EXCHANGE] Auto-update scheduler initialized (checks every 24 hours)');
}
