 
import cors from 'cors';
import { config } from './index.js';

export const PORT = config.port;

export const corsMiddleware = cors({
  origin: (origin, callback) => {
 
     
  if (!origin) {
  if (config.env === 'production') {
    return callback(new Error('Not allowed by CORS'));
  }
  return callback(null, true);
}
    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 
});