import { supabase } from "@/integrations/supabase/client";
import { TestResult, Ranking, Batch, Institute, LeaderboardEntry, TestPerformanceSummary, UserPerformanceHistory } from "@/types/ranking";
import { toast } from "sonner";

/**
 * Save test result to the database
 */
export const saveTestResult = async (testResult: Omit<TestResult, "id" | "createdAt" | "updatedAt">): Promise<TestResult | null> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .upsert({
        user_id: testResult.userId,
        test_id: testResult.testId,
        score: testResult.score,
        total_score: testResult.totalScore,
        accuracy: testResult.accuracy,
        time_taken_seconds: testResult.timeTakenSeconds,
        correct_answers: testResult.correctAnswers,
        incorrect_answers: testResult.incorrectAnswers,
        unattempted_questions: testResult.unattemptedQuestions,
        answers: testResult.answers,
        subject_performance: testResult.subjectPerformance,
        submitted_at: testResult.submittedAt
      }, { onConflict: "user_id, test_id" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      score: data.score,
      totalScore: data.total_score,
      accuracy: data.accuracy,
      timeTakenSeconds: data.time_taken_seconds,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      unattemptedQuestions: data.unattempted_questions,
      answers: data.answers,
      subjectPerformance: data.subject_performance,
      submittedAt: data.submitted_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error: any) {
    console.error("Error saving test result:", error);
    toast.error("Failed to save test result to database");
    return null;
  }
};

/**
 * Get test result for a specific user and test
 */
export const getTestResult = async (userId: string, testId: string): Promise<TestResult | null> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .eq("user_id", userId)
      .eq("test_id", testId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No result found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      score: data.score,
      totalScore: data.total_score,
      accuracy: data.accuracy,
      timeTakenSeconds: data.time_taken_seconds,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      unattemptedQuestions: data.unattempted_questions,
      answers: data.answers,
      subjectPerformance: data.subject_performance,
      submittedAt: data.submitted_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error: any) {
    console.error("Error getting test result:", error);
    return null;
  }
};

/**
 * Get ranking for a specific user and test
 */
export const getRanking = async (userId: string, testId: string): Promise<Ranking | null> => {
  try {
    const { data, error } = await supabase
      .from("rankings")
      .select("*")
      .eq("user_id", userId)
      .eq("test_id", testId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No ranking found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      testId: data.test_id,
      userId: data.user_id,
      batchRank: data.batch_rank,
      batchTotal: data.batch_total,
      instituteRank: data.institute_rank,
      instituteTotal: data.institute_total,
      percentile: data.percentile,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error: any) {
    console.error("Error getting ranking:", error);
    return null;
  }
};

/**
 * Get all batches
 */
export const getBatches = async (): Promise<Batch[]> => {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return data.map(batch => ({
      id: batch.id,
      name: batch.name,
      description: batch.description,
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    }));
  } catch (error: any) {
    console.error("Error getting batches:", error);
    return [];
  }
};

/**
 * Get all institutes
 */
export const getInstitutes = async (): Promise<Institute[]> => {
  try {
    const { data, error } = await supabase
      .from("institutes")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return data.map(institute => ({
      id: institute.id,
      name: institute.name,
      description: institute.description,
      createdAt: institute.created_at,
      updatedAt: institute.updated_at
    }));
  } catch (error: any) {
    console.error("Error getting institutes:", error);
    return [];
  }
};

/**
 * Assign a user to a batch
 */
export const assignUserToBatch = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_batches")
      .upsert({
        user_id: userId,
        batch_id: batchId
      }, { onConflict: "user_id, batch_id" });

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error assigning user to batch:", error);
    toast.error("Failed to assign user to batch");
    return false;
  }
};

/**
 * Assign a user to an institute
 */
export const assignUserToInstitute = async (userId: string, instituteId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_institutes")
      .upsert({
        user_id: userId,
        institute_id: instituteId
      }, { onConflict: "user_id, institute_id" });

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error assigning user to institute:", error);
    toast.error("Failed to assign user to institute");
    return false;
  }
};

/**
 * Get the user's batch
 */
export const getUserBatch = async (userId: string): Promise<Batch | null> => {
  try {
    const { data, error } = await supabase
      .from("user_batches")
      .select("batches(*)")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No batch found
        return null;
      }
      throw error;
    }

    const batch = data.batches;
    return {
      id: batch.id,
      name: batch.name,
      description: batch.description,
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    };
  } catch (error: any) {
    console.error("Error getting user batch:", error);
    return null;
  }
};

/**
 * Get the user's institute
 */
export const getUserInstitute = async (userId: string): Promise<Institute | null> => {
  try {
    const { data, error } = await supabase
      .from("user_institutes")
      .select("institutes(*)")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No institute found
        return null;
      }
      throw error;
    }

    const institute = data.institutes;
    return {
      id: institute.id,
      name: institute.name,
      description: institute.description,
      createdAt: institute.created_at,
      updatedAt: institute.updated_at
    };
  } catch (error: any) {
    console.error("Error getting user institute:", error);
    return null;
  }
};

/**
 * Get leaderboard for a specific test
 */
export const getTestLeaderboard = async (testId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        id,
        user_id,
        score,
        time_taken_seconds,
        profiles:user_id(display_name)
      `)
      .eq("test_id", testId)
      .order("score", { ascending: false })
      .order("time_taken_seconds", { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map((entry, index) => ({
      userId: entry.user_id,
      displayName: entry.profiles?.display_name || "Unknown User",
      score: entry.score,
      rank: index + 1,
      timeTakenSeconds: entry.time_taken_seconds
    }));
  } catch (error: any) {
    console.error("Error getting test leaderboard:", error);
    return [];
  }
};

/**
 * Get batch leaderboard for a specific test
 */
export const getBatchLeaderboard = async (testId: string, batchId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        id,
        user_id,
        score,
        time_taken_seconds,
        profiles:user_id(display_name)
      `)
      .eq("test_id", testId)
      .in("user_id", supabase
        .from("user_batches")
        .select("user_id")
        .eq("batch_id", batchId))
      .order("score", { ascending: false })
      .order("time_taken_seconds", { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map((entry, index) => ({
      userId: entry.user_id,
      displayName: entry.profiles?.display_name || "Unknown User",
      score: entry.score,
      rank: index + 1,
      timeTakenSeconds: entry.time_taken_seconds
    }));
  } catch (error: any) {
    console.error("Error getting batch leaderboard:", error);
    return [];
  }
};

/**
 * Get institute leaderboard for a specific test
 */
export const getInstituteLeaderboard = async (testId: string, instituteId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        id,
        user_id,
        score,
        time_taken_seconds,
        profiles:user_id(display_name)
      `)
      .eq("test_id", testId)
      .in("user_id", supabase
        .from("user_institutes")
        .select("user_id")
        .eq("institute_id", instituteId))
      .order("score", { ascending: false })
      .order("time_taken_seconds", { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map((entry, index) => ({
      userId: entry.user_id,
      displayName: entry.profiles?.display_name || "Unknown User",
      score: entry.score,
      rank: index + 1,
      timeTakenSeconds: entry.time_taken_seconds
    }));
  } catch (error: any) {
    console.error("Error getting institute leaderboard:", error);
    return [];
  }
};

/**
 * Get user's performance history across all tests
 */
export const getUserPerformanceHistory = async (userId: string): Promise<UserPerformanceHistory | null> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();

    if (userError) {
      throw userError;
    }

    const { data: testResults, error: resultsError } = await supabase
      .from("test_results")
      .select(`
        id,
        test_id,
        score,
        total_score,
        accuracy,
        time_taken_seconds,
        submitted_at,
        tests:test_id(title),
        rankings:test_id(percentile)
      `)
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (resultsError) {
      throw resultsError;
    }

    if (testResults.length === 0) {
      return {
        userId,
        displayName: userData.display_name || "Unknown User",
        testResults: [],
        averageScore: 0,
        averagePercentile: 0,
        totalTestsTaken: 0
      };
    }

    const testPerformanceSummaries: TestPerformanceSummary[] = testResults.map(result => ({
      testId: result.test_id,
      testTitle: result.tests?.title || "Unknown Test",
      score: result.score,
      totalScore: result.total_score,
      accuracy: result.accuracy,
      timeTakenSeconds: result.time_taken_seconds,
      percentile: result.rankings?.percentile,
      submittedAt: result.submitted_at
    }));

    // Calculate average score as a percentage
    const averageScore = testResults.reduce((sum, result) => 
      sum + (result.score / result.total_score * 100), 0) / testResults.length;

    // Calculate average percentile
    const resultsWithPercentile = testResults.filter(result => result.rankings?.percentile);
    const averagePercentile = resultsWithPercentile.length > 0 
      ? resultsWithPercentile.reduce((sum, result) => sum + (result.rankings?.percentile || 0), 0) / resultsWithPercentile.length
      : 0;

    return {
      userId,
      displayName: userData.display_name || "Unknown User",
      testResults: testPerformanceSummaries,
      averageScore,
      averagePercentile,
      totalTestsTaken: testResults.length
    };
  } catch (error: any) {
    console.error("Error getting user performance history:", error);
    return null;
  }
};

/**
 * Get subject-wise performance for a user
 */
export const getUserSubjectPerformance = async (userId: string): Promise<Record<string, { correct: number, total: number, attempted: number, averageScore: number }>> => {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select("subject_performance")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // Combine all subject performance data
    const subjectPerformance: Record<string, { correct: number, total: number, attempted: number }> = {};
    
    data.forEach(result => {
      if (result.subject_performance) {
        Object.entries(result.subject_performance).forEach(([subject, performance]) => {
          if (!subjectPerformance[subject]) {
            subjectPerformance[subject] = { correct: 0, total: 0, attempted: 0 };
          }
          
          subjectPerformance[subject].correct += performance.correct;
          subjectPerformance[subject].total += performance.total;
          subjectPerformance[subject].attempted += performance.attempted;
        });
      }
    });

    // Calculate average score for each subject
    const subjectPerformanceWithAverage: Record<string, { correct: number, total: number, attempted: number, averageScore: number }> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, performance]) => {
      const averageScore = performance.total > 0 
        ? (performance.correct / performance.total) * 100 
        : 0;
        
      subjectPerformanceWithAverage[subject] = {
        ...performance,
        averageScore
      };
    });

    return subjectPerformanceWithAverage;
  } catch (error: any) {
    console.error("Error getting user subject performance:", error);
    return {};
  }
};

/**
 * Recalculate rankings for a test
 */
export const recalculateTestRankings = async (testId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc("recalculate_test_rankings", { p_test_id: testId });

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error recalculating test rankings:", error);
    toast.error("Failed to recalculate test rankings");
    return false;
  }
};
