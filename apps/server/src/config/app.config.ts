import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  globalPrefix: process.env.API_PREFIX || 'api',
  name: process.env.APP_NAME || 'MEAN Assessment',
  logLevel: process.env.LOG_LEVEL || 'log',
}));
