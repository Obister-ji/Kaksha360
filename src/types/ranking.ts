export interface TestResult {
  id: string;
  userId: string;
  testId: string;
  score: number;
  totalScore: number;
  accuracy: number;
  timeTakenSeconds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  answers: Record<string, string | null>; // Question ID to answer mapping
  subjectPerformance?: Record<string, { correct: number; total: number; attempted: number }>;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ranking {
  id: string;
  testId: string;
  userId: string;
  batchRank: number;
  batchTotal: number;
  instituteRank: number;
  instituteTotal: number;
  percentile: number;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBatch {
  id: string;
  userId: string;
  batchId: string;
  createdAt: string;
}

export interface Institute {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInstitute {
  id: string;
  userId: string;
  instituteId: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  timeTakenSeconds: number;
}

export interface TestPerformanceSummary {
  testId: string;
  testTitle: string;
  score: number;
  totalScore: number;
  accuracy: number;
  timeTakenSeconds: number;
  rank?: number;
  percentile?: number;
  submittedAt: string;
}

export interface UserPerformanceHistory {
  userId: string;
  displayName: string;
  testResults: TestPerformanceSummary[];
  averageScore: number;
  averagePercentile: number;
  totalTestsTaken: number;
}
