import { Subject } from "@/components/AddSubjectModal";

/**
 * Get the display name for a subject based on its ID or slug
 * @param subjectId The subject ID or slug
 * @param subjects Array of available subjects
 * @returns The subject name or a formatted version of the ID if not found
 */
export const getSubjectDisplayName = (subjectId: string, subjects: Subject[]): string => {
  // Special case for the specific UUID
  if (subjectId === "33bb08a7-1528-4c3e-bea5-79d30c910d01") return "GK";

  // Check if it's a known default subject ID
  if (subjectId === "1" || subjectId === "general-intelligence-reasoning") return "General Intelligence & Reasoning";
  if (subjectId === "2" || subjectId === "general-awareness") return "General Awareness";
  if (subjectId === "3" || subjectId === "quantitative-aptitude") return "Quantitative Aptitude";
  if (subjectId === "4" || subjectId === "english-comprehension") return "English Comprehension";
  if (subjectId === "5" || subjectId === "quantitative-aptitude-reasoning") return "Quantitative Aptitude & Reasoning";
  if (subjectId === "6" || subjectId === "general-awareness-english-comprehension") return "General Awareness & English Comprehension";
  if (subjectId === "gk") return "GK";

  // Try to find the subject in the subjects list
  const subjectInfo = subjects.find(s => s.id === subjectId || s.slug === subjectId);
  if (subjectInfo) return subjectInfo.name;

  // If all else fails, just capitalize the first letter
  return subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
};
