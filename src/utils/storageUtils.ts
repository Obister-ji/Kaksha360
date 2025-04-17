/**
 * Utility functions for safely working with localStorage
 */

/**
 * Safely store data in localStorage with size checking
 * @param key The localStorage key
 * @param data The data to store
 * @param maxSizeMB Maximum size in MB (default: 2MB)
 * @returns Object with success status and optional error message
 */
export const safelyStoreInLocalStorage = (
  key: string,
  data: any,
  maxSizeMB: number = 2
): { success: boolean; error?: string; size?: number } => {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Check the size of the data
    const sizeInBytes = new Blob([jsonData]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    // If data is too large, return error
    if (sizeInMB > maxSizeMB) {
      return {
        success: false,
        error: `Data size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
        size: sizeInMB
      };
    }
    
    // Store data in localStorage
    localStorage.setItem(key, jsonData);
    
    return {
      success: true,
      size: sizeInMB
    };
  } catch (error) {
    // Handle quota exceeded or other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Safely retrieve data from localStorage
 * @param key The localStorage key
 * @param defaultValue Default value to return if key doesn't exist or on error
 * @returns The retrieved data or defaultValue on error
 */
export const safelyRetrieveFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) {
      return defaultValue;
    }
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Error retrieving data from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely remove data from localStorage
 * @param key The localStorage key
 * @returns Success status
 */
export const safelyRemoveFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data from localStorage for key "${key}":`, error);
    return false;
  }
};

/**
 * Check if localStorage is available and has space
 * @returns Object with availability status and storage info
 */
export const checkLocalStorageAvailability = (): { 
  available: boolean; 
  error?: string;
  remainingSpace?: number;
  usedSpace?: number;
  totalSpace?: number;
} => {
  try {
    // Test if localStorage is available
    const testKey = `__storage_test_${Math.random()}`;
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    
    // Estimate available space (this is approximate)
    let usedSpace = 0;
    let totalSpace = 5 * 1024 * 1024; // Assume 5MB total (common limit)
    
    // Calculate used space
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        usedSpace += new Blob([key, value]).size;
      }
    }
    
    const remainingSpace = totalSpace - usedSpace;
    
    return {
      available: true,
      remainingSpace,
      usedSpace,
      totalSpace
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      available: false,
      error: errorMessage
    };
  }
};
