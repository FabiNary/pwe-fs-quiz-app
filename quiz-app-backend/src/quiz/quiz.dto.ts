import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionWithCorrectAnswerDto } from './question-with-correct-answer.dto';
import { QuizSolutionDto } from './quiz-solution.dto';
export class QuizDto extends QuizSolutionDto {
  @ApiProperty({
    description: 'ID des Quizzes',
    example: 'quiz-1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Erstellungsdatum des Quizzes',
    example: '2024-05-01T10:30:00Z',
  })
  @IsDateString()
  created: string;

  @ApiProperty({
    description: 'Datum, bis zu dem das Quiz bearbeitet werden kann',
    example: '2024-05-15T10:30:00Z',
  })
  @IsDateString()
  editableTill: string;

  @ApiProperty({
    description: 'Liste der Fragen im Quiz',
    type: [QuestionWithCorrectAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionWithCorrectAnswerDto)
  questions: QuestionWithCorrectAnswerDto[];
}
