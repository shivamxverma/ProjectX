import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin : process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/user.routes.js';

// Routes Declaration

app.use("/api/v1/users", userRoutes);


export {app};
