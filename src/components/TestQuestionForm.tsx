import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Save, Eye, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { saveTestToGoogleDrive } from "@/services/googleDriveService";
import { fetchSubjects, addSubject } from "@/services/subjectService";
import AddSubjectModal from "./AddSubjectModal";
import { safelyStoreInLocalStorage } from "@/utils/storageUtils";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  imageUrl: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  subject: string; // Changed from enum to string to support custom subjects
  sectionId?: string;
  imageUrl?: string;
  solution?: string;
  marks?: number;
  negativeMarks?: number;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  category?: string;
  slug: string;
}

interface TestQuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPreview: (questions: Question[]) => void;
  testTitle: string;
}

const TestQuestionForm: React.FC<TestQuestionFormProps> = ({ isOpen, onClose, onPreview, testTitle }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "1",
    text: "",
    options: [
      { id: "A", text: "", isCorrect: false, imageUrl: "" },
      { id: "B", text: "", isCorrect: false, imageUrl: "" },
      { id: "C", text: "", isCorrect: false, imageUrl: "" },
      { id: "D", text: "", isCorrect: false, imageUrl: "" },
    ],
    subject: "1", // General Intelligence & Reasoning
    imageUrl: "",
    solution: "",
    marks: 4,
    negativeMarks: 1
  });

  // Fetch subjects when component mounts
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const fetchedSubjects = await fetchSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      }
    };

    loadSubjects();
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    // Load saved questions from localStorage if any
    const savedQuestions = localStorage.getItem(`test_questions_${testTitle}`);
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Error parsing saved questions:", error);
      }
    }
  }, [testTitle]);

  // Save questions to localStorage when they change
  useEffect(() => {
    if (questions.length > 0) {
      console.log(`Saving ${questions.length} questions to localStorage as test_questions_${testTitle}`);

      // Use our utility function to safely store in localStorage
      const storageKey = `test_questions_${testTitle}`;
      const result = safelyStoreInLocalStorage(storageKey, questions);

      if (result.success) {
        console.log(`Successfully saved questions to localStorage (${result.size?.toFixed(2)}MB)`);
      } else {
        console.warn(`Failed to save to localStorage: ${result.error}`);
        // Don't show a toast here to avoid interrupting the user's workflow
      }
    }
  }, [questions, testTitle]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "add_new") {
      // Open the add subject modal
      setIsAddSubjectModalOpen(true);

      // Reset the select to the current value
      setTimeout(() => {
        e.target.value = currentQuestion.subject;
      }, 0);

      return;
    }

    setCurrentQuestion({
      ...currentQuestion,
      subject: value
    });
  };

  const handleOptionChange = (optionId: string, value: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map(option =>
        option.id === optionId ? { ...option, text: value } : option
      )
    });
  };

  const handleCorrectOptionChange = (optionId: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map(option => ({
        ...option,
        isCorrect: option.id === optionId
      }))
    });
  };

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentQuestion({
      ...currentQuestion,
      marks: isNaN(value) ? 0 : value
    });
  };

  const handleNegativeMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentQuestion({
      ...currentQuestion,
      negativeMarks: isNaN(value) ? 0 : value
    });
  };

  const handleSolutionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      solution: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentQuestion({
          ...currentQuestion,
          imageUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageUpload = (optionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentQuestion({
          ...currentQuestion,
          options: currentQuestion.options.map(option =>
            option.id === optionId ? { ...option, imageUrl: event.target?.result as string } : option
          )
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = () => {
    // Validate question
    if (!currentQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Check if at least one option is marked as correct
    const hasCorrectOption = currentQuestion.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      toast.error("Please mark at least one option as correct");
      return;
    }

    // Check if this is the first question for this subject
    const isFirstForSubject = !questions.some(q => q.subject === currentQuestion.subject);
    if (isFirstForSubject) {
      // If it's a custom subject, check if it exists in the subjects list
      const isDefaultSubject = ['1', '2', '3', '4', '5', '6'].includes(currentQuestion.subject);
      const isKnownSubject = isDefaultSubject || subjects.some(s => s.id === currentQuestion.subject);

      if (!isKnownSubject) {
        toast.warning(`You're adding a question to an unknown subject: '${currentQuestion.subject}'. Consider adding this subject first.`);
      } else {
        toast.info(`This is the first question for subject: '${currentQuestion.subject}'. This subject will now appear in the test.`);
      }
    }

    // Add question to list
    setQuestions([...questions, currentQuestion]);

    // Reset current question form
    setCurrentQuestion({
      id: (questions.length + 2).toString(),
      text: "",
      options: [
        { id: "A", text: "", isCorrect: false, imageUrl: "" },
        { id: "B", text: "", isCorrect: false, imageUrl: "" },
        { id: "C", text: "", isCorrect: false, imageUrl: "" },
        { id: "D", text: "", isCorrect: false, imageUrl: "" },
      ],
      subject: currentQuestion.subject,
      imageUrl: "",
      solution: "",
      marks: 4,
      negativeMarks: 1
    });

    toast.success("Question added successfully");
  };

  const removeQuestion = (id: string) => {
    // Filter out the question with the given id
    const updatedQuestions = questions.filter(q => q.id !== id);

    // Update the state
    setQuestions(updatedQuestions);

    // Immediately update localStorage to ensure consistency
    // This is needed because the useEffect might not run immediately
    const storageKey = `test_questions_${testTitle}`;
    if (updatedQuestions.length > 0) {
      const result = safelyStoreInLocalStorage(storageKey, updatedQuestions);
      if (result.success) {
        console.log(`Updated localStorage after removing question. Remaining: ${updatedQuestions.length} questions`);
      } else {
        console.warn(`Failed to update localStorage after removing question: ${result.error}`);
      }
    } else {
      // If no questions left, remove the entry from localStorage
      try {
        localStorage.removeItem(storageKey);
        console.log(`Removed empty question list from localStorage: ${storageKey}`);
      } catch (error) {
        console.error(`Error removing empty question list from localStorage: ${error}`);
      }
    }

    toast.success("Question removed");
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Get all subjects that have questions
    const subjectsWithQuestions = [...new Set(questions.map(q => q.subject))];

    // Check if any subjects have no questions
    const emptySubjects = subjects
      .filter(s => !subjectsWithQuestions.includes(s.id))
      .map(s => s.name);

    // Also check default subjects
    const defaultSubjects = [
      { id: "1", name: "General Intelligence & Reasoning" },
      { id: "2", name: "General Awareness" },
      { id: "3", name: "Quantitative Aptitude" },
      { id: "4", name: "English Comprehension" },
      { id: "5", name: "Quantitative Aptitude & Reasoning" },
      { id: "6", name: "General Awareness & English Comprehension" }
    ];

    const emptyDefaultSubjects = defaultSubjects
      .filter(s => !subjectsWithQuestions.includes(s.id))
      .map(s => s.name);

    const allEmptySubjects = [...emptyDefaultSubjects, ...emptySubjects];

    // Show warning if there are empty subjects
    if (allEmptySubjects.length > 0) {
      toast.warning(`The following subjects have no questions: ${allEmptySubjects.join(', ')}. They will not appear in the test.`);
    }

    onPreview(questions);
  };

  const saveToGoogleDrive = async (questions: Question[]) => {
    try {
      // Create a test data object with title and questions
      const testData = {
        title: testTitle,
        questions: questions
      };
      await saveTestToGoogleDrive(testData);
    } catch (error) {
      console.error("Error saving to Google Drive:", error);
      toast.error("Failed to save to Google Drive");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Test Questions</DialogTitle>
            <DialogDescription>
              Add questions for the test "{testTitle}". You can add multiple questions and preview the test before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Subject and Section selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <div className="flex gap-2">
                  <select
                    id="subject"
                    className="w-full p-2 border rounded-md"
                    value={currentQuestion.subject}
                    onChange={handleSubjectChange}
                  >
                    {/* Default subjects */}
                    <option value="1">General Intelligence & Reasoning</option>
                    <option value="2">General Awareness</option>
                    <option value="3">Quantitative Aptitude</option>
                    <option value="4">English Comprehension</option>
                    <option value="5">Quantitative Aptitude & Reasoning</option>
                    <option value="6">General Awareness & English Comprehension</option>

                    {/* Divider */}
                    {subjects.length > 0 && subjects.some(s => !['1', '2', '3', '4', '5', '6'].includes(s.id)) && (
                      <option disabled>──────────</option>
                    )}

                    {/* Custom subjects */}
                    {subjects
                      .filter(s => !['1', '2', '3', '4', '5', '6'].includes(s.id))
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    }

                    {/* Add new subject option */}
                    <option value="add_new">+ Add New Subject</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setIsAddSubjectModalOpen(true)}
                    title="Add New Subject"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  value={currentQuestion.marks}
                  onChange={handleMarksChange}
                />
              </div>

              <div>
                <Label htmlFor="negative-marks">Negative Marks</Label>
                <Input
                  id="negative-marks"
                  type="number"
                  min="0"
                  value={currentQuestion.negativeMarks}
                  onChange={handleNegativeMarksChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Question Image (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {currentQuestion.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestion({ ...currentQuestion, imageUrl: "" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {currentQuestion.imageUrl && (
                <div className="mt-2 border rounded-md p-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-40 mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Options</Label>
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="option-container">
                  <div className="flex-shrink-0 mr-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={() => handleCorrectOptionChange(option.id)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex-shrink-0 mr-2 mt-2">{option.id})</div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Option ${option.id}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="mt-2">
                      <Label>Option Image (Optional)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOptionImageUpload(option.id, e)}
                          className="flex-1"
                        />
                        {option.imageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: currentQuestion.options.map(o =>
                                  o.id === option.id ? { ...o, imageUrl: "" } : o
                                )
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {option.imageUrl && (
                        <div className="mt-2 border rounded-md p-2">
                          <img
                            src={option.imageUrl}
                            alt={`Option ${option.id}`}
                            className="max-h-32 mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution/Explanation</Label>
              <Textarea
                id="solution"
                placeholder="Enter the solution or explanation for this question..."
                value={currentQuestion.solution || ""}
                onChange={handleSolutionChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={addQuestion}
                className="w-full bg-gold hover:bg-gold/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>

              <Button
                onClick={() => {
                  saveToGoogleDrive(questions);
                  toast.success("Draft saved to Google Drive");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>

            {/* Question List */}
            {questions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium">Added Questions ({questions.length})</h3>
                <div className="space-y-2 mt-2">
                  {questions.map((q, index) => (
                    <div key={q.id} className="p-3 border rounded-md flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        {q.imageUrl && (
                          <img
                            src={q.imageUrl}
                            alt={`Question ${index + 1}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Q{index + 1}.</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {q.subject.charAt(0).toUpperCase() + q.subject.slice(1)}
                            </span>
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              +{q.marks} / -{q.negativeMarks}
                            </span>
                          </div>
                          <p className="mt-1 text-sm line-clamp-2">{q.text}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePreview} className="bg-primary text-white">
              <Eye className="h-4 w-4 mr-2" />
              Preview Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        onSave={async (newSubject) => {
          try {
            // Add the subject using the service
            const savedSubject = await addSubject(newSubject);
            // Update the local subjects state
            setSubjects([...subjects, savedSubject]);
            // Set the current question's subject to the new subject
            setCurrentQuestion({
              ...currentQuestion,
              subject: savedSubject.id
            });
            // Show success message
            toast.success(`Subject "${savedSubject.name}" added successfully`);
            // Close the modal
            setIsAddSubjectModalOpen(false);
          } catch (error) {
            console.error('Error adding subject:', error);
            toast.error('Failed to add subject');
          }
        }}
        existingSubjects={subjects}
      />
    </>
  );
};

export default TestQuestionForm;
