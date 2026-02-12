import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3001;

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});