import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

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
    // Resolve template directory robustly across dev/build environments
    // Priority: explicit env override -> dist path -> source path
    dir: (() => {
      const envDir = process.env.EMAIL_TEMPLATE_DIR;
      if (envDir && fs.existsSync(envDir)) return envDir;

      const distDir = path.resolve(__dirname, '../../templates');
      if (fs.existsSync(distDir)) return distDir;

      // Fallback to source templates (use repo root or current working directory)
      const srcDirFromCwd = path.resolve(process.cwd(), 'apps/server/templates');
      if (fs.existsSync(srcDirFromCwd)) return srcDirFromCwd;

      // Last resort: relative to this file assuming non-bundled execution
      const srcDirFromFile = path.resolve(__dirname, '../../../apps/server/templates');
      return srcDirFromFile;
    })(),
    options: { strict: true },
  },
  preview: process.env.NODE_ENV === 'development',
}));