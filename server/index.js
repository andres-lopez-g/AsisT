import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finance.js';
import plannerRoutes from './routes/planner.js';
import debtRoutes from './routes/debts.js';
import categoryRoutes from './routes/categories.js';
import smartFeaturesRoutes from './routes/smartFeatures.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || !!process.env.VERCEL;

// Security: Check for JWT_SECRET in production/deployment environment
if (isProduction && !process.env.JWT_SECRET) {
    const availableKeys = Object.keys(process.env).filter(k => k.includes('JWT') || k.includes('SECRET') || k.includes('URL') || k.includes('POSTGRES'));
    console.error(`[FATAL] JWT_SECRET is missing in the current environment (${process.env.NODE_ENV || 'unknown'}).`);
    console.log(`[DEBUG] Related Env Keys detected: ${availableKeys.join(', ') || 'None'}`);
    console.log(`[DEBUG] Total Env Keys: ${Object.keys(process.env).length}`);

    // We don't exit here to allow the logs to be visible in the Vercel dashboard
    // The app will only fail later when a JWT operation is performed.
}

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Vercel Proxy for rate limiting
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Fusion Observatory API Running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/smart', smartFeaturesRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// Catch-all for unmatched routes - return JSON instead of HTML
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Only listen if not in a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Global error handlers to prevent crashes and ensure JSON responses
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    // Don't exit in production to keep the server running
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production to keep the server running
});

export default app;
