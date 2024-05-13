import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { StudentModule } from '../student/student.module';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [StudentModule, QuizModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
