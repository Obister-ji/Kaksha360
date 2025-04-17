
import { toast } from "sonner";
import { saveToGoogleDrive, openGoogleDriveFolder, getShareableLink, TEST_FOLDER_ID } from "./googleApiService";

// Save test data to Google Drive
export const saveTestToGoogleDrive = async (testData: any): Promise<boolean> => {
  try {
    // Create a filename based on test title and timestamp
    const testTitle = testData.title || "Unknown Test";
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${testTitle}_${timestamp}.json`;
    
    // Save using the Google API service
    const success = await saveToGoogleDrive(testData, fileName);
    
    if (success) {
      toast.success("Test saved to Google Drive successfully");
    }
    
    return success;
  } catch (error) {
    console.error("Error saving test to Google Drive:", error);
    toast.error("Failed to save test to Google Drive");
    return false;
  }
};

// Open the Google Drive folder in a new tab
export const openGoogleDriveTestFolder = (): void => {
  openGoogleDriveFolder();
};

// Get Google Drive folder URL
export const getGoogleDriveTestFolderUrl = (): string => {
  return getShareableLink();
};

// Check if Google Drive folder ID is configured
export const isGoogleDriveFolderConfigured = (): boolean => {
  return !!TEST_FOLDER_ID;
};
