import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV === 'development',
  path: process.env.SWAGGER_PATH || 'docs',
  title: process.env.SWAGGER_TITLE || 'MEAN Assessment API',
  description: process.env.SWAGGER_DESCRIPTION || 'RESTful API for the MEAN Assessment project with authentication, user management, and product catalog features',
  version: process.env.SWAGGER_VERSION || '1.0.0',
  contact: {
    name: process.env.SWAGGER_CONTACT_NAME || 'API Support',
    email: process.env.SWAGGER_CONTACT_EMAIL || 'api-support@mean-assessment.local',
  },
  license: {
    name: process.env.SWAGGER_LICENSE_NAME || 'MIT',
    url: process.env.SWAGGER_LICENSE_URL || 'https://opensource.org/licenses/MIT',
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000/api',
      description: process.env.SWAGGER_SERVER_DESCRIPTION || 'Development server',
    },
  ],
}));