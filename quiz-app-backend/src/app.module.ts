// src/app.module.ts
import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { QuizModule } from './quiz/quiz.module';
import {MailerModule} from "./mailer/mailer.module";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Dadurch steht das ConfigModule in der gesamten Anwendung zur Verfügung
    }),
    MailerModule,
    StudentModule,
    CourseModule,
    QuizModule,
    AuthModule
  ],
})
export class AppModule {}
