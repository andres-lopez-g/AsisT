/**
 * Database configuration utilities
 */

/**
 * Remove sslmode parameter from PostgreSQL connection string
 * This allows us to configure SSL programmatically with rejectUnauthorized: false
 * to support self-signed certificates from cloud database providers
 * 
 * @param {string} connectionString - PostgreSQL connection string
 * @returns {string} - Connection string with sslmode parameter removed
 */
export function cleanConnectionString(connectionString) {
    if (!connectionString) {
        return connectionString;
    }
    
    // Handle all cases of sslmode parameter placement:
    // - ?sslmode=...& -> ?
    // - &sslmode=...& -> &
    // - ?sslmode=... at end -> remove
    // - &sslmode=... at end -> remove
    let cleaned = connectionString;
    cleaned = cleaned.replace(/\?sslmode=[^&]*&/, '?');
    cleaned = cleaned.replace(/&sslmode=[^&]*&/, '&');
    cleaned = cleaned.replace(/\?sslmode=[^&]*$/, '');
    cleaned = cleaned.replace(/&sslmode=[^&]*$/, '');
    
    return cleaned;
}
