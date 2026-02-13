 
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config, isProduction } from './index.js';

export function initSentry(app) {
  if (!isProduction || !process.env.SENTRY_DSN) {
    console.log('Sentry: Disabled (development mode or no DSN)');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: config.env,
    
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Profiling
    profilesSampleRate: 0.1, // 10% of transactions
    integrations: [
      nodeProfilingIntegration(),
    ],
    
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove API keys from error messages
      if (event.message) {
        event.message = event.message.replace(/ghp_\w+/g, '[REDACTED]');
        event.message = event.message.replace(/gsk_\w+/g, '[REDACTED]');
      }
      
      return event;
    },
    
    // Don't send errors for these
    ignoreErrors: [
      'Not allowed by CORS',
      'GitHub user not found',
      'No commits found',
    ],
  });

  // Request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  
  console.log(' Sentry initialized');
}

export function sentryErrorHandler() {
  // Error handler must be before any other error middleware
  return Sentry.setupExpressErrorHandler({
    shouldHandleError(error) {
      // Capture all errors with status >= 500
      return error.status >= 500;
    },
  });
}

export { Sentry };