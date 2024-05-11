import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentDto } from './student.dto';
import { generateFilename } from '../utils/generateFileName';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { uuid } from 'uuidv4';
import { parse } from 'csv-parse/sync';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class StudentService {
  private readonly baseDir = join(__dirname, '..', 'data', 'courses');
  constructor(private readonly mailerService: MailerService) {}

  addStudentsFromCsv(courseName: string, csvContent: string): void {
    const dirName = generateFilename(courseName);
    const courseDir = join(this.baseDir, dirName);

    if (!existsSync(courseDir)) {
      throw new NotFoundException(`Kurs '${courseName}' nicht gefunden.`);
    }

    let students: StudentDto[] = parse(csvContent, {
      columns: ['name', 'email'],
      skip_empty_lines: true,
    }).map((student: Omit<StudentDto, 'quizCreationId'>) => {
      return {
        ...student,
        quizCreationId: uuid(),
        id: uuid(),
      };
    });

    writeFileSync(
      join(courseDir, 'students.json'),
      JSON.stringify(students, null, 2),
    );
  }

  getStudentsByCourseName(courseName: string): StudentDto[] {
    const dirName = generateFilename(courseName);
    return this.getStudentsByCourseDir(dirName);
  }

  getStudentsByCourseDir(dirName: string): StudentDto[] {
    const courseDir = join(this.baseDir, dirName);

    if (!existsSync(courseDir)) {
      throw new NotFoundException(`Kurs '${courseDir}' nicht gefunden.`);
    }

    const studentsFile = join(courseDir, 'students.json');

    if (!existsSync(studentsFile)) return [];

    const students: StudentDto[] = JSON.parse(
      readFileSync(studentsFile, 'utf-8'),
    );
    return JSON.parse(readFileSync(studentsFile, 'utf-8'));
  }

  async notifyStudentsToCreateQuiz(
    courseName: string,
    students: StudentDto[],
  ): Promise<void> {
    const baseUrl = 'http://localhost:3000';

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const quizCreationUrl = this.buildUrl(`${baseUrl}/create-quiz`, {
        course: courseName,
        quizId: student.quizCreationId,
      });

      await this.mailerService.sendMail({
        to: student.email,
        subject: `Erstellen Sie Ihr Quiz im Kurs "${courseName}"`,
        text: `Hallo ${student.name},\n\nBitte erstellen Sie Ihr Quiz im Kurs "${courseName}".\n\nHier ist Ihr Link: ${quizCreationUrl}`,
      });
    }
  }

  notifyStudentsQuizAvailable(
    courseName: string,
    students: StudentDto[],
    quizId: string,
    duration: Date,
  ): void {
    const baseUrl = 'http://localhost:3000';
    students.forEach((student) => {
      const quizUrl = this.buildUrl(`${baseUrl}/quiz`, {
        course: courseName,
        quizId: quizId,
        studentId: student.id,
      });
      const formattedDuration = duration.toISOString();

      this.mailerService.sendMail({
        to: student.email,
        subject: `Quiz verfügbar im Kurs "${courseName}"`,
        text: `Hallo ${student.name},\n\nDas Quiz im Kurs "${courseName}" ist jetzt verfügbar.\n\nBitte bearbeiten Sie es bis zum ${formattedDuration} unter folgendem Link: ${quizUrl}`,
      });
    });
  }
  private buildUrl(base, params) {
    const query = Object.keys(params)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
      )
      .join('&');
    return `${base}?${query}`;
  }
}
