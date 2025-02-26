import express from 'express';
const app = express();
import connectDB from './DB/connectDB.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js'
import { User } from './models/user.model.js';
dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);


app.listen(PORT, ()=>{
    connectDB()
   console.log(`server is up and running on port ${PORT}`);
});
