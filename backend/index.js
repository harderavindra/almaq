import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import signedUrlRouter from './routes/signedUrlRouter.js'; // adjust path as needed

import departmentRoutes from "./routes/department.routes.js";
import farmerRoutes from "./routes/farmer.routes.js";
import plantRoutes from "./routes/plant.routes.js";
import orderRoutes from "./routes/order.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5174','http://localhost:5173', 'https://almaq-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
}));
app.use(cookieParser());

app.use(express.json());



mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


app.get('/', (req, res) => {
    res.send({ message: 'Server is running' });
});


app.use('/api/auth', authRoutes);
app.use('/api', signedUrlRouter);
app.use("/api/departments", departmentRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/orders", orderRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


