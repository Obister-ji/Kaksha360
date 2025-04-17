import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format seconds into a MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format time object into a readable format
 */
export const formatTimeObject = (time: { minutes: number, seconds: number }): string => {
  return `${time.minutes}m ${time.seconds}s`;
};

/**
 * Convert time object to total seconds
 */
export const timeObjectToSeconds = (time: { minutes: number, seconds: number }): number => {
  return (time.minutes * 60) + time.seconds;
};

/**
 * Convert seconds to time object
 */
export const secondsToTimeObject = (seconds: number): { minutes: number, seconds: number } => {
  return {
    minutes: Math.floor(seconds / 60),
    seconds: seconds % 60
  };
};

/**
 * Parse duration string (e.g., "3 hours", "90 minutes") to seconds
 */
export const parseDurationToSeconds = (durationString: string): number => {
  if (!durationString) return 3 * 60 * 60; // Default to 3 hours if no duration provided

  const hoursMatch = durationString.match(/(\d+)\s*hours?/i);
  const minutesMatch = durationString.match(/(\d+)\s*min(ute)?s?/i);

  let totalSeconds = 0;
  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 60 * 60;
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;

  // If no valid time format was found, try to parse as a number of hours
  if (totalSeconds === 0) {
    const numericMatch = durationString.match(/(\d+(\.\d+)?)/);
    if (numericMatch) {
      totalSeconds = parseFloat(numericMatch[1]) * 60 * 60;
    }
  }

  // Default to 3 hours if no valid time is found
  return totalSeconds || (3 * 60 * 60);
};

/**
 * Convert duration string to time object
 */
export const parseDurationToTimeObject = (durationString: string): { minutes: number, seconds: number } => {
  const totalSeconds = parseDurationToSeconds(durationString);
  return secondsToTimeObject(totalSeconds);
};
