import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { programRouter } from './routes/program.route';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", programRouter);
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

const PORT = process.env.PORT || 3001;

mongoose
    .connect(process.env.MONGODB_URI || "")
    .then(() => {
        console.log("Connected to DB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(() => {
        console.log("Connection failed");
    });