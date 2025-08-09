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
      useFactory: async (configService: ConfigService) => ({
        transport: configService.get('email.transport'),
        defaults: configService.get('email.defaults'),
        template: {
          dir: configService.get('email.template.dir'),
          adapter: new HandlebarsAdapter(),
          options: configService.get('email.template.options'),
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}