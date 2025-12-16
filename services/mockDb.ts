import { Exam, Submission, User, UserRole, Feedback } from '../types';

// specific credentials provided
const CREDENTIALS = [
  // Students
  { username: '222BCAA29', password: 'STUD1', role: UserRole.STUDENT, name: 'Student 222BCAA29' },
  { username: '232BCAA65', password: 'STUD2', role: UserRole.STUDENT, name: 'Student 232BCAA65' },
  { username: '232BCAA16', password: 'STUD3', role: UserRole.STUDENT, name: 'Student 232BCAA16' },
  { username: '232BCAA22', password: 'STUD4', role: UserRole.STUDENT, name: 'Student 232BCAA22' },
  // Teachers
  { username: 'POWBI26', password: 'TEACH1', role: UserRole.TEACHER, name: 'Prof. PowerBI', subject: 'Power BI' },
  { username: 'MA26', password: 'TEACH2', role: UserRole.TEACHER, name: 'Prof. Mathematics', subject: 'Mathematics' },
  { username: 'SE26', password: 'TEACH3', role: UserRole.TEACHER, name: 'Prof. Software Eng', subject: 'Software Engineering' },
  { username: 'IOT26', password: 'TEACH4', role: UserRole.TEACHER, name: 'Prof. IoT', subject: 'Internet of Things' },
  { username: 'AI26', password: 'TEACH5', role: UserRole.TEACHER, name: 'Prof. AI', subject: 'Artificial Intelligence' },
];

const STORAGE_KEYS = {
  EXAMS: 'smartcia_exams',
  SUBMISSIONS: 'smartcia_submissions',
  CURRENT_USER: 'smartcia_current_user',
  FEEDBACK: 'smartcia_feedback'
};

export const db = {
  // Authentication
  authenticate: (username: string, password: string): User | null => {
    const cred = CREDENTIALS.find(u => u.username === username && u.password === password);
    if (cred) {
      const user: User = {
        id: cred.username, // Using username as ID for simplicity
        name: cred.name,
        role: cred.role,
        email: `${cred.username.toLowerCase()}@university.edu`
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Exams
  saveExam: (exam: Exam) => {
    const exams = db.getExams();
    const existingIndex = exams.findIndex(e => e.id === exam.id);
    if (existingIndex >= 0) {
      exams[existingIndex] = exam;
    } else {
      exams.push(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  getExams: (): Exam[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return stored ? JSON.parse(stored) : [];
  },

  getExamById: (id: string): Exam | undefined => {
    return db.getExams().find(e => e.id === id);
  },

  // Submissions
  saveSubmission: (submission: Submission) => {
    const subs = db.getSubmissions();
    const existingIndex = subs.findIndex(s => s.id === submission.id);
    if (existingIndex >= 0) {
      subs[existingIndex] = submission;
    } else {
      subs.push(submission);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
  },

  getSubmissions: (): Submission[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return stored ? JSON.parse(stored) : [];
  },

  getSubmissionsForExam: (examId: string): Submission[] => {
    return db.getSubmissions().filter(s => s.examId === examId);
  },

  updateSubmissionGrade: (submissionId: string, questionId: string, newMarks: number) => {
    const subs = db.getSubmissions();
    const subIndex = subs.findIndex(s => s.id === submissionId);
    
    if (subIndex >= 0) {
      const submission = subs[subIndex];
      const answerIndex = submission.answers.findIndex(a => a.questionId === questionId);
      
      if (answerIndex >= 0) {
        submission.answers[answerIndex].obtainedMarks = newMarks;
        submission.answers[answerIndex].isGraded = true;
        
        // Recalculate total score
        submission.totalScore = submission.answers.reduce((acc, curr) => acc + (curr.obtainedMarks || 0), 0);
        
        // Save back
        subs[subIndex] = submission;
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
        return true;
      }
    }
    return false;
  },

  // Feedback Methods
  saveFeedback: (feedback: Feedback) => {
    const items = db.getAllFeedback();
    items.push(feedback);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(items));
  },

  getAllFeedback: (): Feedback[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    return stored ? JSON.parse(stored) : [];
  },

  getFeedbackForExam: (examId: string): Feedback[] => {
    return db.getAllFeedback().filter(f => f.examId === examId);
  },

  resolveFeedback: (feedbackId: string) => {
    const items = db.getAllFeedback();
    const index = items.findIndex(f => f.id === feedbackId);
    if (index >= 0) {
      items[index].isResolved = true;
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(items));
    }
  }
};
