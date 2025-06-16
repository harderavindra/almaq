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
import masterRoutes from "./routes/master.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

import challanRoutes from "./routes/challan.routes.js";
import orderItemsRoutes from "./routes/orderItems.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import utilityRoutes from "./routes/utility.routes.js";
import reportyRoutes from "./routes/reporty.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:5174','http://localhost:5173', 'https://almaq-frontend.vercel.app',
         'https://almaqbiotech.com',
  'https://www.almaqbiotech.com',
  'https://api.almaqbiotech.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
}));






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
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/orderItems", orderItemsRoutes);
app.use("/api/utility", utilityRoutes);
app.use("/api/reports", reportyRoutes);
app.use("/api/invoices", invoiceRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


