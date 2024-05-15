import { Injectable, NotFoundException } from '@nestjs/common';
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  mkdtempSync,
  unlinkSync,
  rmdirSync,
} from 'fs';
import { join } from 'path';
import { generateFilename } from '../utils/generateFileName';
import { StudentService } from '../student/student.service';
import { QuizService } from '../quiz/quiz.service';
import { QuizDto } from '../quiz/quiz.dto';
import { PassThrough, Readable } from 'stream';
import { tmpdir } from 'os';
import * as archiver from 'archiver';
import { StudentDto } from '../student/student.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CourseService {
  private readonly baseDir: string;

  constructor(
    private readonly studentService: StudentService,
    private readonly quizService: QuizService,
    private readonly configService: ConfigService,
  ) {
    this.baseDir = configService.get<string>('QUIZ_DATA_DIR');
  }

  createCourseDirectory(courseName: string): string {
    const dirName = generateFilename(courseName);
    const courseDir = join(this.baseDir, dirName);

    if (!existsSync(courseDir)) {
      mkdirSync(courseDir, { recursive: true });
      mkdirSync(join(courseDir, 'quizzes'), { recursive: true });
      const metadata = { courseName };
      writeFileSync(
        join(courseDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2),
      );
    }

    return courseDir;
  }

  listCourses(): any[] {
    const courses: string[] = [];

    if (existsSync(this.baseDir)) {
      const dirs = readdirSync(this.baseDir);

      dirs.forEach((dir) => {
        const metadataPath = join(this.baseDir, dir, 'metadata.json');

        if (existsSync(metadataPath)) {
          const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
          courses.push(metadata.courseName);
        }
      });
    }

    return courses;
  }

  transformIdsInStudentNames(
    students: StudentDto[],
    quizzes: { [s: string]: QuizDto },
  ) {
    return Object.keys(quizzes)
      .map((quizKey) => {
        const student = this.findStudentByAtt(
          students,
          quizKey,
          'quizCreationId',
        );

        if (!student) return;

        return {
          student: student.name,
          answers: quizzes[quizKey].answers,
        };
      })
      .filter((obj) => {
        return obj !== undefined;
      })
      .map((studentAnswers) => {
        const newAnswers = {};

        Object.keys(studentAnswers.answers).forEach((studentAnswerKey) => {
          const student = this.findStudentByAtt(
            students,
            studentAnswerKey,
            'id',
          );
          if (student) {
            newAnswers[student.name] = studentAnswers.answers[studentAnswerKey];
          }
        });

        return {
          student: studentAnswers.student,
          answers: newAnswers,
        };
      });
  }

  findStudentByAtt(students: StudentDto[], indicator: string, att: string) {
    return students.find((student) => {
      return student[att] === indicator;
    });
  }

  bringStudentAnswersIntoArrayFormat(studentAnswers: any): {
    [s: string]: Array<Array<string>>;
  } {
    const objContainsArrays = {};

    studentAnswers.forEach((studentAnswer) => {
      const array1 = [];

      array1.push([studentAnswer.student]);

      Object.keys(studentAnswer.answers).forEach((answeringStudentName) => {
        const array2 = [answeringStudentName];
        Object.keys(studentAnswer.answers[answeringStudentName]).forEach(
          (questionNumber) => {
            array2.push(
              `${questionNumber}:${this.getAnswerMapping(studentAnswer.answers[answeringStudentName][questionNumber])}`,
            );
          },
        );
        array1.push(array2);
      });

      objContainsArrays[generateFilename(studentAnswer.student)] = array1;
    });

    return objContainsArrays;
  }

  getAnswerMapping(num: number | string): string {
    let numToCalculate = typeof num === 'number' ? num : undefined;

    if(typeof num === 'string') {
      let parsedNumber = parseInt(num);
      if (isNaN(parsedNumber)) return '';
      numToCalculate = parsedNumber;
    }

    if (numToCalculate < 1 || numToCalculate > 21) {
      return '';
    }

    // Berechne den entsprechenden Buchstaben im Alphabet
    const charCode = 'a'.charCodeAt(0) + numToCalculate - 1;
    return String.fromCharCode(charCode);
  }

  createAnswersCsvStrings(answers: { [s: string]: Array<Array<string>> }) {
    const answersCsvStrings = {};

    Object.keys(answers).forEach((answerKey) => {
      answersCsvStrings[answerKey] = answers[answerKey]
        .map((arrayEntry) => {
          if (arrayEntry.length < 1) return '';
          if (arrayEntry.length === 1) return arrayEntry[0];

          return `${arrayEntry[0]};${[...arrayEntry].slice(1).join(',')}`;
        })
        .join('\n');
    });

    return answersCsvStrings;
  }

  async getStudentSolutionsAsZip(courseName: string): Promise<Readable> {
    const courseDir = generateFilename(courseName);
    const dir = join(this.baseDir, courseDir);

    if (!existsSync(dir)) {
      throw new NotFoundException(`Kurs '${courseName}' nicht gefunden`);
    }

    const students: StudentDto[] =
      this.studentService.getStudentsByCourseDir(courseDir);
    const quizzes: { [key: string]: QuizDto } =
      this.quizService.getQuizzesByCourseDir(courseDir);

    let studentFiles: any = this.transformIdsInStudentNames(students, quizzes);
    studentFiles = this.bringStudentAnswersIntoArrayFormat(studentFiles);
    studentFiles = this.createAnswersCsvStrings(studentFiles);

    // Temporäres Verzeichnis für CSV-Dateien
    const tempDir = mkdtempSync(join(tmpdir(), 'solutions-'));
    const csvFiles: string[] = [];

    const quizSolutionsOverviewString = this.createQuizSolutionOverview(students, quizzes);
    const quizSolutionsOverviewPath = join(tempDir, 'Loesungen.csv');
    writeFileSync(quizSolutionsOverviewPath, quizSolutionsOverviewString);
    csvFiles.push(quizSolutionsOverviewPath);

    for (const studentId in studentFiles) {
      const csvFilePath = join(tempDir, `${studentId}.csv`);
      writeFileSync(csvFilePath, studentFiles[studentId]);
      csvFiles.push(csvFilePath);
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const passThrough = new PassThrough();

    archive.pipe(passThrough);

    for (const file of csvFiles) {
      const fileName = file.split('/').pop();
      archive.append(readFileSync(file), { name: fileName });
    }

    await archive.finalize();

    // Temporäres Verzeichnis aufräumen
    for (const file of csvFiles) {
      unlinkSync(file);
    }
    rmdirSync(tempDir);

    return passThrough;
  }

  createQuizSolutionOverview(students: StudentDto[], quizzes: {[key: string]: QuizDto}) {
    return Object.keys(quizzes).map((studentQuizId) => {
      const matchingStudent = students.find((student) => {
        return student.quizCreationId === studentQuizId;
      });

      if(!matchingStudent) return;

      const csvRow = [matchingStudent.name];

      quizzes[studentQuizId].questions.forEach((question) => {
        csvRow.push(this.getAnswerMapping(question.correctAnswer));
      });

      return csvRow.join(';');
    }).filter((csvRow) => {
      return !!csvRow;
    }).join('\n');
  }
}
