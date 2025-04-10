import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(cors({
    origin: ['http://localhost:5174', 'https://almaq-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());



mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


app.get('/', (req, res) => {
    res.send({ message: 'Server is running' });
});


app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


