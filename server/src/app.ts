import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import appRoutes from '@routes/index.js';
import { errorHandler } from './errors/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files for local uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parser
app.use(express.json());
app.use(urlencoded({ extended: true }));

// ============= Routes  =======================
app.use('/api/', appRoutes);

// not found
app.use((_req, res) => {
    res.status(400).json({ messgae: "Not found!" });
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