export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  marks: number;
  options?: string[]; // For MCQ
  correctOptionIndex?: number; // For MCQ
  rubric?: string; // For AI grading guidance
  sampleAnswer?: string; // For AI reference
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  questions: Question[];
  createdBy: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  studentAnswer: string | number; // string for text, number for option index
  obtainedMarks?: number;
  feedback?: string;
  isGraded: boolean;
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: Answer[];
  totalScore: number;
  maxScore: number;
  submittedAt: string;
  aiEvaluated: boolean;
}

export interface Feedback {
  id: string;
  examId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  text: string;
  timestamp: string;
  isResolved: boolean;
}
