import express from 'express';
import { corsMiddleware, PORT } from './config/cors.js';
import { logger } from './utils/logger.js';
import { config, isProduction } from './config/index.js';
import { 
  apiLimiter, 
  generateLimiter, 
  securityHeaders, 
  sanitizeData 
} from './middleware/security.js';
import healthRoutes from './routes/health.js';
import generateRoutes from './routes/generate.js';

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

// Trust proxy (important for rate limiting behind reverse proxy)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(securityHeaders);
app.use(sanitizeData);

// CORS
app.use(corsMiddleware);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api', apiLimiter, healthRoutes);
app.use('/api/generate', generateLimiter, generateRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: isProduction ? 'Internal server error' : err.message,
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(` POST90 backend running on port ${PORT}`);
  logger.info(`   Environment: ${config.env}`);
  logger.info(`   CORS Origins: ${config.corsOrigins.join(', ')}`);
  logger.info(`   Health:   GET  http://localhost:${PORT}/api/health`);
  logger.info(`   Validate: GET  http://localhost:${PORT}/api/validate-username`);
  logger.info(`   Generate: POST http://localhost:${PORT}/api/generate`);
});

export default app;