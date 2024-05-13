// src/student/student.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { AddStudentsAsCsvDto } from '../course/add-students-as-csv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentDto } from './student.dto';

@ApiTags('Student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post(':courseName/addStudentsAsCsv')
  @ApiOperation({
    summary: 'Fügt Studenten aus einer CSV-Datei zu einem Kurs hinzu',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV-Datei mit Studenten',
    type: AddStudentsAsCsvDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async addStudentsAsCsv(
    @Param('courseName') courseName: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const csvContent = file.buffer.toString('utf-8');
    this.studentService.addStudentsFromCsv(courseName, csvContent);
    const students = this.studentService.getStudentsByCourseName(courseName);
    this.studentService
      .notifyStudentsToCreateQuiz(courseName, students)
      .then((r) => r);
    return {
      message: `Studenten erfolgreich zum Kurs '${courseName}' hinzugefügt`,
    };
  }

  @Get('getStudentsByCourse/:course')
  @ApiOperation({
    summary: 'Gibt alle Studierenden eines bestimmten Kurses zurück',
  })
  @ApiResponse({
    status: 200,
    description: 'Eine Liste der Studierende in einem Kurs',
    isArray: true,
    type: StudentDto,
  })
  async getStudentsByCourse(@Param('course') courseName: string) {
    return this.studentService.getStudentsByCourseName(courseName);
  }
}
