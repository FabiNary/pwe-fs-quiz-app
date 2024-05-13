// src/mailer/mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
          ignoreTLS: true,
          secure: false,
        },
        defaults: {
          from: 'Quiz App',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
