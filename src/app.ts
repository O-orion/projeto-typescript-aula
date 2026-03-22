import "reflect-metadata"
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import errorHandler from "./middleware/errorHandler.js";
import indexRouter from "./routes/index.routes.js";
import { validarBody } from "./middleware/validarBody.js";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const app = express();

app.set('trust proxy', 1);

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
}));

app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(morgan("dev"));
app.use(express.json());

app.use(compression({ threshold: 1024 }))

app.use('/api', indexRouter);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.post("/api/test-error", validarBody({}), (req, res) => {
  throw new Error("Erro forçado");
});

app.use(errorHandler)

export default app;
