import { Subject } from "../components/AddSubjectModal";

// Mock data for subjects
const MOCK_SUBJECTS: Subject[] = [
  {
    id: "1",
    name: "General Intelligence & Reasoning",
    code: "GIR101",
    category: "Competitive Exams",
    slug: "general-intelligence-reasoning"
  },
  {
    id: "2",
    name: "General Awareness",
    code: "GA101",
    category: "Competitive Exams",
    slug: "general-awareness"
  },
  {
    id: "3",
    name: "Quantitative Aptitude",
    code: "QA101",
    category: "Competitive Exams",
    slug: "quantitative-aptitude"
  },
  {
    id: "4",
    name: "English Comprehension",
    code: "EC101",
    category: "Competitive Exams",
    slug: "english-comprehension"
  },
  {
    id: "5",
    name: "Quantitative Aptitude & Reasoning",
    code: "QAR101",
    category: "Competitive Exams",
    slug: "quantitative-aptitude-reasoning"
  },
  {
    id: "6",
    name: "General Awareness & English Comprehension",
    code: "GAEC101",
    category: "Competitive Exams",
    slug: "general-awareness-english-comprehension"
  }
];

// Get all subjects
export const fetchSubjects = async (): Promise<Subject[]> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    // Try to get subjects from localStorage first
    const storedSubjects = localStorage.getItem('subjects');
    if (storedSubjects) {
      resolve(JSON.parse(storedSubjects));
    } else {
      // If no subjects in localStorage, use mock data
      localStorage.setItem('subjects', JSON.stringify(MOCK_SUBJECTS));
      resolve(MOCK_SUBJECTS);
    }
  });
};

// Add a new subject
export const addSubject = async (subject: Subject): Promise<Subject> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    // Get existing subjects
    const storedSubjects = localStorage.getItem('subjects');
    const subjects = storedSubjects ? JSON.parse(storedSubjects) : MOCK_SUBJECTS;

    // Add new subject
    subjects.push(subject);

    // Save to localStorage
    localStorage.setItem('subjects', JSON.stringify(subjects));

    resolve(subject);
  });
};

// Update a subject
export const updateSubject = async (subject: Subject): Promise<Subject> => {
  // In a real app, this would be an API call
  return new Promise((resolve, reject) => {
    // Get existing subjects
    const storedSubjects = localStorage.getItem('subjects');
    const subjects = storedSubjects ? JSON.parse(storedSubjects) : MOCK_SUBJECTS;

    // Find subject index
    const index = subjects.findIndex((s: Subject) => s.id === subject.id);

    if (index === -1) {
      reject(new Error('Subject not found'));
      return;
    }

    // Update subject
    subjects[index] = subject;

    // Save to localStorage
    localStorage.setItem('subjects', JSON.stringify(subjects));

    resolve(subject);
  });
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
  // In a real app, this would be an API call
  return new Promise((resolve, reject) => {
    // Get existing subjects
    const storedSubjects = localStorage.getItem('subjects');
    const subjects = storedSubjects ? JSON.parse(storedSubjects) : MOCK_SUBJECTS;

    // Find subject index
    const index = subjects.findIndex((s: Subject) => s.id === id);

    if (index === -1) {
      reject(new Error('Subject not found'));
      return;
    }

    // Remove subject
    subjects.splice(index, 1);

    // Save to localStorage
    localStorage.setItem('subjects', JSON.stringify(subjects));

    resolve();
  });
};
