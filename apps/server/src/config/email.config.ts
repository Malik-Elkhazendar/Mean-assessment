import { registerAs } from '@nestjs/config';

/**
 * Email configuration for SMTP and templating
 * Uses Mailtrap for development and testing email delivery
 */
export default registerAs('email', () => ({
  transport: {
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  defaults: {
    from: process.env.MAIL_FROM || '"MEAN Assessment" <noreply@mean-assessment.local>',
  },
  template: {
    dir: process.cwd() + '/apps/server/templates',
    adapter: 'handlebars',
    options: {
      strict: true,
    },
  },
  preview: process.env.NODE_ENV === 'development',
}));