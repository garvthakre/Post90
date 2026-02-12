import express from 'express';
import { corsMiddleware, PORT } from './config/cors.js';
import healthRoutes from './routes/health.js';
import generateRoutes from './routes/generate.js';

const app = express();

// Middleware  
app.use(corsMiddleware);
app.use(express.json());

//  Routes 
app.use('/api', healthRoutes);
app.use('/api/generate', generateRoutes);

//  Start 
app.listen(PORT, () => {
  console.log(` POST90 backend running on http://localhost:${PORT}`);
  console.log(`   Health:   GET  http://localhost:${PORT}/api/health`);
  console.log(`   Validate: GET  http://localhost:${PORT}/api/validate-username`);
  console.log(`   Generate: POST http://localhost:${PORT}/api/generate`);
});

export default app;