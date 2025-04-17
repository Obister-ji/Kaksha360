import { supabase } from "@/integrations/supabase/client";
import { TestSchedule } from "@/types/test";
import { Question } from "@/components/TestQuestionForm";
import { toast } from "sonner";
import { secondsToTimeObject, timeObjectToSeconds } from "@/lib/utils";
import { safelyStoreInLocalStorage, safelyRetrieveFromLocalStorage } from "@/utils/storageUtils";

// Fallback test data in case Supabase tables don't exist yet
const fallbackTests: TestSchedule[] = [
  {
    id: "1",
    title: "JEE Main Test Series - 6 Test Paper (Full Syllabus Test)",
    instructor: "LAKSHYA",
    date: "2025/01/20",
    time: "02:00 PM - 05:00 PM",
    duration: "3 hours",
    status: "ONLINE",
    participants: ["Class 12 - Science"]
  },
  {
    id: "2",
    title: "12th Class Online Test (P Block Elements) Chemistry",
    instructor: "LAKSHYA",
    date: "2025/01/09",
    time: "07:30 PM - 08:30 PM",
    duration: "1 hour",
    status: "ONLINE",
    participants: ["Class 12 - Science"]
  },
  {
    id: "3",
    title: "12th Class Online Test (Organic Chemistry) Chemistry",
    instructor: "LAKSHYA",
    date: "2025/01/08",
    time: "07:30 PM - 08:30 PM",
    duration: "1 hour",
    status: "ONLINE",
    participants: ["Class 12 - Science"]
  }
];

// Flag to track if we've shown the Supabase setup message
let hasShownSupabaseSetupMessage = false;

// Interface for test submission data
interface TestSubmissionData {
  testId: string;
  answers: (string | null)[];
  timeTaken: { minutes: number; seconds: number };
  timeTakenSeconds: number;
  score?: number;
  totalScore?: number;
  submittedAt: string;
}

/**
 * Check if the required Supabase tables exist
 */
const checkSupabaseTables = async (): Promise<boolean> => {
  try {
    // Try to query the tests table
    const { error } = await supabase
      .from("tests")
      .select("id")
      .limit(1);

    // If there's a 404 error, the table doesn't exist
    if (error && error.code === "PGRST116") {
      if (!hasShownSupabaseSetupMessage) {
        toast.error(
          "Supabase tables not set up. Please run the SQL script in supabase/migrations/create_test_tables.sql"
        );
        hasShownSupabaseSetupMessage = true;
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking Supabase tables:", error);
    return false;
  }
};

/**
 * Fetch all tests from Supabase
 */
export const fetchTests = async (): Promise<TestSchedule[]> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      console.log("Using fallback test data since Supabase tables don't exist");
      return fallbackTests;
    }

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Convert Supabase data to TestSchedule format
    return data.map((test) => ({
      id: test.id,
      title: test.title,
      instructor: test.instructor,
      date: test.date,
      time: test.time,
      duration: test.duration,
      status: test.status as "ONLINE" | "OFFLINE",
      participants: test.participants || [],
    }));
  } catch (error: any) {
    console.error("Error fetching tests:", error);
    toast.error("Failed to load tests");
    return fallbackTests;
  }
};

/**
 * Create a new test in Supabase
 */
export const createTest = async (test: Omit<TestSchedule, "id">): Promise<TestSchedule | null> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      // Generate a new ID for the test
      const newId = (fallbackTests.length + 1).toString();
      const newTest: TestSchedule = {
        id: newId,
        title: test.title,
        instructor: test.instructor,
        date: test.date,
        time: test.time,
        duration: test.duration,
        status: test.status,
        participants: test.participants || [],
      };

      // Add to fallback tests
      fallbackTests.push(newTest);

      return newTest;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("tests")
      .insert({
        title: test.title,
        instructor: test.instructor,
        date: test.date,
        time: test.time,
        duration: test.duration,
        status: test.status,
        participants: test.participants || [],
        created_at: new Date().toISOString(),
        created_by: userData.user?.id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      instructor: data.instructor,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status as "ONLINE" | "OFFLINE",
      participants: data.participants || [],
    };
  } catch (error: any) {
    console.error("Error creating test:", error);
    toast.error("Failed to create test in Supabase. Using local storage instead.");

    // Fallback to local storage
    const newId = (fallbackTests.length + 1).toString();
    const newTest: TestSchedule = {
      id: newId,
      title: test.title,
      instructor: test.instructor,
      date: test.date,
      time: test.time,
      duration: test.duration,
      status: test.status,
      participants: test.participants || [],
    };

    // Add to fallback tests
    fallbackTests.push(newTest);

    return newTest;
  }
};

/**
 * Update an existing test in Supabase
 */
export const updateTest = async (test: TestSchedule): Promise<boolean> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      // Update in fallback tests
      const index = fallbackTests.findIndex(t => t.id === test.id);
      if (index !== -1) {
        fallbackTests[index] = test;
        return true;
      }
      return false;
    }

    const { error } = await supabase
      .from("tests")
      .update({
        title: test.title,
        instructor: test.instructor,
        date: test.date,
        time: test.time,
        duration: test.duration,
        status: test.status,
        participants: test.participants || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", test.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error updating test:", error);
    toast.error("Failed to update test in Supabase. Using local storage instead.");

    // Fallback to local storage
    const index = fallbackTests.findIndex(t => t.id === test.id);
    if (index !== -1) {
      fallbackTests[index] = test;
      return true;
    }
    return false;
  }
};

/**
 * Delete a test from Supabase
 */
export const deleteTest = async (id: string): Promise<boolean> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      // Delete from fallback tests
      const index = fallbackTests.findIndex(t => t.id === id);
      if (index !== -1) {
        fallbackTests.splice(index, 1);
        return true;
      }
      return false;
    }

    // First delete all related questions and options (cascade delete not assumed)
    const { data: questions } = await supabase
      .from("test_questions")
      .select("id")
      .eq("test_id", id);

    if (questions && questions.length > 0) {
      const questionIds = questions.map(q => q.id);

      // Delete options for all questions
      await supabase
        .from("test_options")
        .delete()
        .in("question_id", questionIds);

      // Delete questions
      await supabase
        .from("test_questions")
        .delete()
        .eq("test_id", id);
    }

    // Delete the test
    const { error } = await supabase
      .from("tests")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting test:", error);
    toast.error("Failed to delete test in Supabase. Using local storage instead.");

    // Fallback to local storage
    const index = fallbackTests.findIndex(t => t.id === id);
    if (index !== -1) {
      fallbackTests.splice(index, 1);
      return true;
    }
    return false;
  }
};

/**
 * Save test questions to Supabase
 */
export const saveTestQuestions = async (testId: string, questions: Question[]): Promise<boolean> => {
  console.log(`Saving ${questions.length} questions for test ${testId}:`, questions);

  // Handle empty questions array - this means all questions were deleted
  if (questions.length === 0) {
    console.log(`No questions to save for test ${testId}. This likely means all questions were deleted.`);

    try {
      // Remove from localStorage
      localStorage.removeItem(`test_questions_${testId}`);
      console.log(`Removed empty question list from localStorage for test ${testId}`);

      // If we're using Supabase, we would delete all questions for this test here
      const tablesExist = await checkSupabaseTables();
      if (tablesExist) {
        // TODO: Implement deletion of all questions for this test in Supabase
        console.log(`Supabase tables exist, but deletion of all questions is not implemented yet`);
      }

      return true;
    } catch (error) {
      console.error(`Error handling empty questions for test ${testId}:`, error);
      return false;
    }
  }

  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      // Save to localStorage instead using our utility function
      const storageKey = `test_questions_${testId}`;
      const result = safelyStoreInLocalStorage(storageKey, questions);

      if (result.success) {
        toast.success(`Questions saved to local storage (${result.size?.toFixed(2)}MB)`);
        return true;
      } else {
        console.error(`Failed to save to localStorage: ${result.error}`);
        if (result.size) {
          toast.warning(`Test data is too large (${result.size.toFixed(2)}MB) for local storage. Please set up database storage.`);
        } else {
          toast.error("Failed to save questions to local storage. Please set up database storage.");
        }
        return false;
      }
    }

    // For each question, save it and its options
    for (const question of questions) {
      // Save the question
      const { data: questionData, error: questionError } = await supabase
        .from("test_questions")
        .insert({
          test_id: testId,
          text: question.text,
          subject: question.subject,
          image_url: question.imageUrl || null,
          solution: question.solution || null,
          marks: question.marks || 4,
          negative_marks: question.negativeMarks || 1,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (questionError) {
        throw questionError;
      }

      // Save options for this question
      for (const option of question.options) {
        const { error: optionError } = await supabase
          .from("test_options")
          .insert({
            question_id: questionData.id,
            option_id: option.id,
            text: option.text,
            is_correct: option.isCorrect,
            image_url: option.imageUrl || null,
            created_at: new Date().toISOString(),
          });

        if (optionError) {
          throw optionError;
        }
      }
    }

    return true;
  } catch (error: any) {
    console.error("Error saving test questions:", error);
    toast.error("Failed to save test questions to Supabase. Using local storage instead.");

    // Fallback to localStorage
    localStorage.setItem(`test_questions_${testId}`, JSON.stringify(questions));
    return true;
  }
};

/**
 * Create mock questions for testing with sample images
 */
const createMockQuestions = (testId: string): Question[] => {
  console.log(`Creating mock questions for test ID: ${testId}`);

  // Sample image URLs for questions and options
  const sampleImageUrls = [
    'https://i.imgur.com/JR8ilft.png', // Physics equation
    'https://i.imgur.com/XzwQB5z.png', // Chemistry structure
    'https://i.imgur.com/GQQWUe3.png', // Math equation
    'https://i.imgur.com/LZwXQCT.png', // Graph
    'https://i.imgur.com/Y5Wd0Vn.png', // Circuit diagram
  ];

  return Array(25).fill(null).map((_, i) => {
    const subject = i % 6 === 0 ? '1' : i % 6 === 1 ? '2' : i % 6 === 2 ? '3' : i % 6 === 3 ? '4' : i % 6 === 4 ? '5' : '6';

    // Add images to some questions (every 3rd question)
    const hasQuestionImage = i % 3 === 0;
    const questionImageUrl = hasQuestionImage ? sampleImageUrls[i % sampleImageUrls.length] : undefined;

    // Create options with images for some options (every 4th option)
    const options = [
      {
        id: `q-${i + 1}-a`,
        text: `Option A for question ${i + 1}`,
        isCorrect: i % 4 === 0,
        imageUrl: i % 4 === 0 ? sampleImageUrls[(i + 1) % sampleImageUrls.length] : undefined
      },
      {
        id: `q-${i + 1}-b`,
        text: `Option B for question ${i + 1}`,
        isCorrect: i % 4 === 1,
        imageUrl: i % 4 === 1 ? sampleImageUrls[(i + 2) % sampleImageUrls.length] : undefined
      },
      {
        id: `q-${i + 1}-c`,
        text: `Option C for question ${i + 1}`,
        isCorrect: i % 4 === 2,
        imageUrl: i % 4 === 2 ? sampleImageUrls[(i + 3) % sampleImageUrls.length] : undefined
      },
      {
        id: `q-${i + 1}-d`,
        text: `Option D for question ${i + 1}`,
        isCorrect: i % 4 === 3,
        imageUrl: i % 4 === 3 ? sampleImageUrls[(i + 4) % sampleImageUrls.length] : undefined
      }
    ];

    return {
      id: `q-${i + 1}`,
      text: `This is question ${i + 1} about ${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
      subject: subject,
      imageUrl: questionImageUrl,
      options: options,
      marks: 4,
      negativeMarks: 1
    };
  });
};

/**
 * Fetch test questions for a specific test
 */
export const fetchTestQuestions = async (testId: string): Promise<Question[]> => {
  console.log(`Fetching questions for test ${testId}`);
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      // Try to get from localStorage using our utility function
      const storageKey = `test_questions_${testId}`;
      console.log(`Checking localStorage for ${storageKey}`);

      // Check if the key exists in localStorage first
      const keyExists = localStorage.getItem(storageKey) !== null;

      // If the key exists but is empty or contains an empty array, it means all questions were deleted
      if (keyExists) {
        const savedQuestions = safelyRetrieveFromLocalStorage<Question[]>(storageKey, []);

        // Return the saved questions, even if it's an empty array
        // This is important to distinguish between "no questions saved yet" and "all questions deleted"
        console.log(`Retrieved ${savedQuestions.length} questions from localStorage for test ${testId}`);
        return savedQuestions;
      }
      console.log("No questions found in localStorage, returning mock questions");
      return createMockQuestions(testId);
    }

    // Fetch questions for the test
    const { data: questionsData, error: questionsError } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", testId);

    if (questionsError) {
      throw questionsError;
    }

    const questions: Question[] = [];

    // For each question, fetch its options
    for (const questionData of questionsData) {
      const { data: optionsData, error: optionsError } = await supabase
        .from("test_options")
        .select("*")
        .eq("question_id", questionData.id);

      if (optionsError) {
        throw optionsError;
      }

      // Map options to the expected format
      const options = optionsData.map(option => ({
        id: option.option_id,
        text: option.text,
        isCorrect: option.is_correct,
        imageUrl: option.image_url || "",
      }));

      // Add the question with its options
      questions.push({
        id: questionData.id,
        text: questionData.text,
        subject: questionData.subject,
        imageUrl: questionData.image_url || undefined,
        solution: questionData.solution || undefined,
        marks: questionData.marks || undefined,
        negativeMarks: questionData.negative_marks || undefined,
        options,
      });
    }

    return questions;
  } catch (error: any) {
    console.error("Error fetching test questions:", error);
    toast.error("Failed to load test questions from Supabase. Checking local storage.");

    // Try to get from localStorage as fallback
    const savedQuestions = localStorage.getItem(`test_questions_${testId}`);
    if (savedQuestions) {
      try {
        return JSON.parse(savedQuestions);
      } catch (e) {
        console.error("Error parsing saved questions:", e);
      }
    }
    console.log("Falling back to mock questions after error");
    return createMockQuestions(testId);
  }
};

/**
 * Save test submission data including time taken
 */
export const saveTestSubmission = (testId: string, answers: (string | null)[], timeTaken: { minutes: number; seconds: number }, score?: number, totalScore?: number): void => {
  console.log(`Saving test submission with score: ${score}, totalScore: ${totalScore}`);
  try {
    // Convert time taken to seconds for easier calculations
    const timeTakenSeconds = timeObjectToSeconds(timeTaken);

    // Create submission data
    const submissionData: TestSubmissionData = {
      testId,
      answers,
      timeTaken,
      timeTakenSeconds,
      score,
      totalScore,
      submittedAt: new Date().toISOString()
    };

    console.log("Saving submission data:", submissionData);

    // Save to localStorage
    localStorage.setItem(`test_${testId}_submission`, JSON.stringify(submissionData));
    localStorage.setItem(`test_${testId}_answers`, JSON.stringify(answers));
    localStorage.setItem(`test_${testId}_time_taken`, JSON.stringify(timeTaken));
    localStorage.setItem(`test_${testId}_time_taken_seconds`, timeTakenSeconds.toString());

    // Mark test as completed
    const completedTests = localStorage.getItem('completed_tests');
    let testsArray = completedTests ? JSON.parse(completedTests) : [];
    if (!testsArray.includes(testId)) {
      testsArray.push(testId);
      localStorage.setItem('completed_tests', JSON.stringify(testsArray));
    }

    console.log(`Test submission saved for test ID: ${testId}`);
  } catch (error) {
    console.error("Error saving test submission:", error);
  }
};

/**
 * Get test submission data including time taken
 */
export const getTestSubmission = (testId: string): TestSubmissionData | null => {
  try {
    const submissionData = localStorage.getItem(`test_${testId}_submission`);
    if (submissionData) {
      return JSON.parse(submissionData);
    }

    // If full submission data doesn't exist, try to reconstruct from individual pieces
    const answers = localStorage.getItem(`test_${testId}_answers`);
    const timeTaken = localStorage.getItem(`test_${testId}_time_taken`);
    const timeTakenSeconds = localStorage.getItem(`test_${testId}_time_taken_seconds`);

    if (answers && timeTaken) {
      return {
        testId,
        answers: JSON.parse(answers),
        timeTaken: JSON.parse(timeTaken),
        timeTakenSeconds: timeTakenSeconds ? parseInt(timeTakenSeconds, 10) : 0,
        submittedAt: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting test submission:", error);
    return null;
  }
};

/**
 * Get time taken for a specific test
 */
export const getTestTimeTaken = (testId: string): { minutes: number; seconds: number } | null => {
  try {
    // First try to get from the time_taken storage
    const timeTaken = localStorage.getItem(`test_${testId}_time_taken`);
    if (timeTaken) {
      return JSON.parse(timeTaken);
    }

    // If that doesn't exist, try to get from seconds
    const timeTakenSeconds = localStorage.getItem(`test_${testId}_time_taken_seconds`);
    if (timeTakenSeconds) {
      const seconds = parseInt(timeTakenSeconds, 10);
      return secondsToTimeObject(seconds);
    }

    // If neither exists, try to get from the full submission
    const submission = getTestSubmission(testId);
    if (submission && submission.timeTaken) {
      return submission.timeTaken;
    }

    // Default fallback
    return { minutes: 0, seconds: 0 };
  } catch (error) {
    console.error("Error getting test time taken:", error);
    return { minutes: 0, seconds: 0 };
  }
};