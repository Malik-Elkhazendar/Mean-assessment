import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';

/**
 * Email Module
 * Configures MailerService for sending transactional emails
 * Uses Handlebars templates and Mailtrap for email delivery
 */
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const templateDir = configService.get<string>('email.template.dir');
        const options = configService.get('email.template.options');
        return {
          transport: configService.get('email.transport'),
          defaults: configService.get('email.defaults'),
          template: {
            // Use resolved dir from config; falls back to module default if undefined
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options,
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}