import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import appRoutes from '@routes/index.js';
import { errorHandler } from './errors/errorHandler.js';

dotenv.config();

const app = express();

// security
app.use(helmet());

// cors
app.use(cors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true
}));

// Logging development only
if(process.env['NODE_ENV'] === 'development') {
    console.log("env: ", process.env['NODE_ENV']);
    app.use(morgan('dev'));
};

app.use(cookieParser());

// Body parser
app.use(express.json());
app.use(urlencoded({ extended: true }));

// ============= Routes  =======================
app.use('/api/', appRoutes);

// not found
app.use((_req, res) => {
    res.status(4000).json({ messgae: "Not found!" });
});

// error middleware
// app.use((err:Error, _req: Request, res: Response, _next: NextFunction) => {
//     console.log("Error occurred", err);
//     res.status(500).json({ message: "Interenal Server Error" });
// })

app.use(errorHandler);

const PORT = process.env['PORT'];
app.listen(PORT, () => {
    console.log(`PORT running on ${PORT}`);
});