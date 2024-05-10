// src/dto/student.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID } from 'class-validator';

export class StudentDto {
    @ApiProperty({
        description: 'Name des Studenten',
        example: 'Hans Müller',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'E-Mail des Studenten',
        example: 'hans.mueller@edu.fhdw.de',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Eindeutige Kennung für die Quiz-Erstellung',
        example: 'c79bd7a1-1a82-426b-a2d9-b3fa0376a532',
    })
    @IsUUID()
    quizCreationId: string;

    @ApiProperty({
        description: 'Eindeutige Kennung des Studenten',
        example: '2f6ad46e-23ed-4486-b010-ccb63694a719',
    })
    @IsUUID()
    id: string;
}
