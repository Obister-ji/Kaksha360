import { supabase } from "@/integrations/supabase/client";
import { StudyMaterial } from "@/types/test";
import { toast } from "sonner";

/**
 * Check if Supabase study_materials table exists
 */
const checkSupabaseTable = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("study_materials").select("id").limit(1);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error checking Supabase study_materials table:", error);
    return false;
  }
};

/**
 * Fetch all study materials from Supabase
 */
export const fetchStudyMaterials = async (): Promise<StudyMaterial[]> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.log("Supabase study_materials table doesn't exist yet");
      return [];
    }

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .order("uploadDate", { ascending: false });

    if (error) {
      throw error;
    }

    return data.map((material) => ({
      id: material.id,
      title: material.title,
      description: material.description,
      fileUrl: material.fileUrl,
      subject: material.subject,
      uploadedBy: material.uploadedBy,
      uploadDate: material.uploadDate,
      fileType: material.fileType
    }));
  } catch (error: any) {
    console.error("Error fetching study materials:", error);
    toast.error("Failed to load study materials from Supabase");
    return [];
  }
};

/**
 * Create a new study material in Supabase
 */
export const createStudyMaterial = async (material: Omit<StudyMaterial, "id">): Promise<StudyMaterial | null> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase study_materials table doesn't exist yet");
      toast.error("Failed to create study material in Supabase");
      return null;
    }

    // Get user data but don't require authentication
    let createdBy = null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      createdBy = userData.user?.id || null;
    } catch (authError) {
      console.warn("Not authenticated, continuing without user ID", authError);
    }

    // Log the study material being created
    console.log("Creating study material:", {
      title: material.title,
      description: material.description,
      fileUrl: material.fileUrl,
      subject: material.subject,
      uploadedBy: material.uploadedBy,
      uploadDate: material.uploadDate,
      fileType: material.fileType
    });

    // Create the study material without requiring authentication
    const { data, error } = await supabase
      .from("study_materials")
      .insert({
        title: material.title,
        description: material.description,
        fileUrl: material.fileUrl,
        subject: material.subject,
        uploadedBy: material.uploadedBy,
        uploadDate: material.uploadDate,
        fileType: material.fileType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Study material created successfully:", data);
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      subject: data.subject,
      uploadedBy: data.uploadedBy,
      uploadDate: data.uploadDate,
      fileType: data.fileType
    };
  } catch (error: any) {
    console.error("Error creating study material:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The study_materials table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("A study material with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to create study materials. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to create study material: ${error.message || "Unknown error"}`);
    }
    
    return null;
  }
};

/**
 * Update an existing study material in Supabase
 */
export const updateStudyMaterial = async (material: StudyMaterial): Promise<boolean> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase study_materials table doesn't exist yet");
      toast.error("Failed to update study material in Supabase");
      return false;
    }

    // Log the study material being updated
    console.log("Updating study material:", {
      id: material.id,
      title: material.title,
      description: material.description,
      fileUrl: material.fileUrl,
      subject: material.subject,
      uploadedBy: material.uploadedBy,
      uploadDate: material.uploadDate,
      fileType: material.fileType
    });

    const { error } = await supabase
      .from("study_materials")
      .update({
        title: material.title,
        description: material.description,
        fileUrl: material.fileUrl,
        subject: material.subject,
        uploadedBy: material.uploadedBy,
        uploadDate: material.uploadDate,
        fileType: material.fileType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", material.id);

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Study material updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating study material:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The study_materials table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("A study material with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to update study materials. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to update study material: ${error.message || "Unknown error"}`);
    }
    
    return false;
  }
};

/**
 * Delete a study material from Supabase
 */
export const deleteStudyMaterial = async (id: string): Promise<boolean> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase study_materials table doesn't exist yet");
      toast.error("Failed to delete study material from Supabase");
      return false;
    }

    // Log the study material being deleted
    console.log("Deleting study material with ID:", id);

    const { error } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Study material deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting study material:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The study_materials table doesn't exist. Please run the database migrations.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to delete study materials. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to delete study material: ${error.message || "Unknown error"}`);
    }
    
    return false;
  }
};
