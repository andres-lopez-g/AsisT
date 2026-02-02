const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);
    if (err.stack) console.error(err.stack);

    // Prevent sending response if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    // Default to 500 Server Error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File too large. Maximum limit is 10MB.';
    }

    // Ensure we always return JSON
    res.status(statusCode).json({
        error: message,
        status: statusCode
    });
};

export default errorHandler;
