import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class QuizSolutionDto {
    @ApiProperty({
        description: 'Antworten des Studenten',
        example: {
            1: 2, // Frage 1 - Antwort 2
            2: 4, // Frage 2 - Antwort 4
            3: 3, // Frage 3 - Antwort 3
        },
    })
    @IsObject()
    answers: {
        [s: string]: {
            [n: number]: number
        };
    };
}