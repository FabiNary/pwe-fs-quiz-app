// src/course/course.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { StudentService } from '../student/student.service';
import { QuizService } from '../quiz/quiz.service';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { QuizDto } from '../quiz/quiz.dto';
import { StudentDto } from '../student/student.dto';

describe('CourseService', () => {
  let courseService: CourseService;
  let studentService: jest.Mocked<StudentService>;
  let quizService: jest.Mocked<QuizService>;
  let tempDir: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: StudentService,
          useValue: { getStudentsByCourseDir: jest.fn() },
        },
        {
          provide: QuizService,
          useValue: { getQuizzesByCourseDir: jest.fn() },
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    studentService = module.get(StudentService) as jest.Mocked<StudentService>;
    quizService = module.get(QuizService) as jest.Mocked<QuizService>;

    tempDir = `${tmpdir()}/solutions-12345`;

    jest.spyOn(fs, 'mkdtempSync').mockReturnValue(tempDir);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    jest.spyOn(fs, 'rmdirSync').mockImplementation(() => {});
  });

  it('should create a zip file with student solutions', () => {
    //given

    const students: StudentDto[] = [
      {
        id: 'c3f7dfb9-3454-482f-a5b6-285ec5590b60',
        name: 'Alice Müller',
        email: 'alice.mueller@edu.fhdw.de',
        quizCreationId: '0e1f2e36-e9e5-4b5b-ab0e-7ccdd24be880',
      },
      {
        id: '4e6a0648-2c1e-4905-a615-5f4d763f0ebe',
        name: 'Hans Schmitz',
        email: 'hans.schmitz@edu.fhdw.de',
        quizCreationId: '2bad72a0-667e-4ed7-891f-38164ddea900',
      },
    ];
    const quizzes: { [key: string]: QuizDto } = {
      '0e1f2e36-e9e5-4b5b-ab0e-7ccdd24be880': {
        id: '0e1f2e36-e9e5-4b5b-ab0e-7ccdd24be880',
        created: '2024-01-01T00:00:00Z',
        editableTill: '2024-02-01T00:00:00Z',
        questions: [
          {
            id: 1,
            question: 'Q1',
            answers: { 1: 'A1', 2: 'A2', 3: 'A3', 4: 'A4' },
            correctAnswer: 1,
          },
          {
            id: 2,
            question: 'Q2',
            answers: { 1: 'B1', 2: 'B2', 3: 'B3', 4: 'B4' },
            correctAnswer: 2,
          },
        ],
        answers: {
          '4e6a0648-2c1e-4905-a615-5f4d763f0ebe': {
            1: 1,
            2: 2,
          },
        },
      },
      '2bad72a0-667e-4ed7-891f-38164ddea900': {
        id: '2bad72a0-667e-4ed7-891f-38164ddea900',
        created: '2024-01-01T00:00:00Z',
        editableTill: '2024-02-01T00:00:00Z',
        questions: [
          {
            id: 1,
            question: 'Q1',
            answers: { 1: 'A1', 2: 'A2', 3: 'A3', 4: 'A4' },
            correctAnswer: 1,
          },
          {
            id: 2,
            question: 'Q2',
            answers: { 1: 'B1', 2: 'B2', 3: 'B3', 4: 'B4' },
            correctAnswer: 2,
          },
        ],
        answers: {
          'c3f7dfb9-3454-482f-a5b6-285ec5590b60': {
            1: 1,
            2: 2,
          },
        },
      },
    };

    const expected = [
      {
        answers: { 'Hans Schmitz': { 1: 1, 2: 2 } },
        student: 'Alice Müller',
      },
      {
        answers: { 'Alice Müller': { 1: 1, 2: 2 } },
        student: 'Hans Schmitz',
      },
    ];

    //when

    const result = courseService.transformIdsInStudentNames(students, quizzes);

    //then

    expect(result).toStrictEqual(expected);
  });

  it('should bring the answers into array format', () => {
    // given
    const given = [
      {
        answers: { 'Hans Schmitz': { 1: 1, 2: 2 } },
        student: 'Alice Müller',
      },
      {
        answers: { 'Alice Müller': { 1: 1, 2: 2 } },
        student: 'Hans Schmitz',
      },
    ];
    const expected = {
      'alice-mueller': [['Alice Müller'], ['Hans Schmitz', '1:a', '2:b']],
      'hans-schmitz': [['Hans Schmitz'], ['Alice Müller', '1:a', '2:b']],
    };
    // when
    const result = courseService.bringStudentAnswersIntoArrayFormat(given);

    // then

    expect(result).toStrictEqual(expected);
  });

  it('should bring the answers into array format', () => {
    // given
    const given = {
      'alice-mueller': [['Alice Müller'], ['Hans Schmitz', '1:a', '2:b']],
      'hans-schmitz': [['Hans Schmitz'], ['Alice Müller', '1:a', '2:b']],
    };
    const expected = {
      'alice-mueller': 'Alice Müller\nHans Schmitz;1:a,2:b',
      'hans-schmitz': 'Hans Schmitz\nAlice Müller;1:a,2:b',
    };
    // when
    const result = courseService.createAnswersCsvStrings(given);

    // then

    expect(result).toStrictEqual(expected);
  });
});
