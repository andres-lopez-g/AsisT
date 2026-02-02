/**
 * Utility function to send consistent error responses
 * @param {Object} res - Express response object
 * @param {Error} err - Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - User-friendly error message
 */
export const sendErrorResponse = (res, err, statusCode = 500, message = 'Server error. Please try again later.') => {
    // Log the actual error for debugging
    console.error(`[ERROR] ${new Date().toISOString()}:`, err);
    
    // Prevent sending response if headers already sent
    if (res.headersSent) {
        console.error('[ERROR] Headers already sent, cannot send error response');
        return;
    }
    
    // Send JSON error response
    res.status(statusCode).json({ 
        error: message,
        status: statusCode
    });
};
