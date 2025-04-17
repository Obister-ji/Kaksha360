
export interface TestSchedule {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  status: "ONLINE" | "OFFLINE";
  participants?: string[];
  startDateTime?: string; // ISO string for the exact start time
  endDateTime?: string;   // ISO string for the exact end time
}

export type UserRole = "ADMIN" | "USER";

export interface TestOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestQuestion {
  id: string;
  text: string;
  options: TestOption[];
  subject: "physics" | "chemistry" | "mathematics";
}

export interface TestResult {
  score: number;
  totalScore: number;
  timeTaken: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  partiallyCorrectAnswers: number;
  unattemptedQuestions: number;
  rank?: {
    batch: number;
    batchTotal: number;
    institute: number;
    instituteTotal: number;
    percentile: number;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  important: boolean;
}

export interface VideoResource {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  subject: string;
  uploadedBy: string;
  date: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  subject: string;
  uploadedBy: string;
  uploadDate: string;
  fileType: "pdf" | "doc" | "ppt" | "other";
}

export interface Doubt {
  id: string;
  question: string;
  askedBy: string;
  date: string;
  subject: string;
  status: "answered" | "pending";
  answers?: {
    id: string;
    text: string;
    answeredBy: string;
    date: string;
  }[];
}
