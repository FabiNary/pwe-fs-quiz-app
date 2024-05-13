import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsObject, IsPositive } from 'class-validator';

export class QuestionWithoutCorrectAnswerDto {
  @ApiProperty({
    description: 'Frage',
    example: 'Was ist die Hauptstadt von Frankreich?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Antworten als Key-Value-Paar',
    example: { 1: 'Paris', 2: 'Madrid', 3: 'Berlin', 4: 'Lissabon' },
  })
  @IsObject()
  answers: { [key: number]: string };

  @ApiProperty({
    description: 'ID der Frage',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  id: number;
}
