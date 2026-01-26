import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finance.js';
import documentsRoutes from './routes/documents.js';
import plannerRoutes from './routes/planner.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
app.use('/api/documents', documentsRoutes);
app.use('/api/planner', plannerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
