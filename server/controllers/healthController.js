import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function health(_req, res) {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  logger.info('Health check performed');
  res.json(healthData);
}

export async function validateUsername(req, res) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ valid: false, message: 'Username is required' });
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      },
    );

    if (response.status === 404) {
      return res.json({ valid: false, message: 'GitHub user not found' });
    }
    if (!response.ok) {
      return res.json({ valid: false, message: 'Unable to validate username' });
    }

    return res.json({ valid: true });
  } catch {
    return res.status(500).json({ valid: false, message: 'Validation failed' });
  }
}