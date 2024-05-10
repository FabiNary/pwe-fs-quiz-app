// src/quiz/quiz.module.ts
import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import {StudentModule} from "../student/student.module";

@Module({
    imports: [StudentModule],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService],
})
export class QuizModule {}
