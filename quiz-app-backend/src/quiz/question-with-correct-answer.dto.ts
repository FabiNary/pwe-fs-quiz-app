import { IsInt, IsPositive } from 'class-validator';
import {QuestionWithoutCorrectAnswerDto} from "./question-without-correct-answer.dto";
import {ApiProperty} from "@nestjs/swagger";

export class QuestionWithCorrectAnswerDto extends QuestionWithoutCorrectAnswerDto{
    @ApiProperty({
        description: 'Index der richtigen Antwort',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    correctAnswer: number;
}
