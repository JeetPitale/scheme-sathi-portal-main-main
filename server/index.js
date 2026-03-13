import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import eligibilityRoutes from './routes/eligibilityRoutes.js';

// Connect to Database
connectDB();

// Routes
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/schemes', eligibilityRoutes); // Optional alias or separate if needed

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
