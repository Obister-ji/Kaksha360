import { supabase } from "@/integrations/supabase/client";
import { VideoResource } from "@/types/test";
import { toast } from "sonner";

/**
 * Check if Supabase videos table exists
 */
const checkSupabaseTable = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("videos").select("id").limit(1);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error checking Supabase videos table:", error);
    return false;
  }
};

/**
 * Fetch all videos from Supabase
 */
export const fetchVideos = async (): Promise<VideoResource[]> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.log("Supabase videos table doesn't exist yet");
      return [];
    }

    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return data.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      subject: video.subject,
      uploadedBy: video.uploadedBy,
      date: video.date
    }));
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    toast.error("Failed to load videos from Supabase");
    return [];
  }
};

/**
 * Create a new video in Supabase
 */
export const createVideo = async (video: Omit<VideoResource, "id">): Promise<VideoResource | null> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase videos table doesn't exist yet");
      toast.error("Failed to create video in Supabase");
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

    // Log the video being created
    console.log("Creating video:", {
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      subject: video.subject,
      uploadedBy: video.uploadedBy,
      date: video.date
    });

    // Create the video without requiring authentication
    const { data, error } = await supabase
      .from("videos")
      .insert({
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        subject: video.subject,
        uploadedBy: video.uploadedBy,
        date: video.date,
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

    console.log("Video created successfully:", data);
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      youtubeId: data.youtubeId,
      subject: data.subject,
      uploadedBy: data.uploadedBy,
      date: data.date
    };
  } catch (error: any) {
    console.error("Error creating video:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The videos table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("A video with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to create videos. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to create video: ${error.message || "Unknown error"}`);
    }
    
    return null;
  }
};

/**
 * Update an existing video in Supabase
 */
export const updateVideo = async (video: VideoResource): Promise<boolean> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase videos table doesn't exist yet");
      toast.error("Failed to update video in Supabase");
      return false;
    }

    // Log the video being updated
    console.log("Updating video:", {
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      subject: video.subject,
      uploadedBy: video.uploadedBy,
      date: video.date
    });

    const { error } = await supabase
      .from("videos")
      .update({
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        subject: video.subject,
        uploadedBy: video.uploadedBy,
        date: video.date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Video updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating video:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The videos table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("A video with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to update videos. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to update video: ${error.message || "Unknown error"}`);
    }
    
    return false;
  }
};

/**
 * Delete a video from Supabase
 */
export const deleteVideo = async (id: string): Promise<boolean> => {
  try {
    // Check if Supabase table exists
    const tableExists = await checkSupabaseTable();
    if (!tableExists) {
      console.error("Supabase videos table doesn't exist yet");
      toast.error("Failed to delete video from Supabase");
      return false;
    }

    // Log the video being deleted
    console.log("Deleting video with ID:", id);

    const { error } = await supabase
      .from("videos")
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

    console.log("Video deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting video:", error);
    
    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The videos table doesn't exist. Please run the database migrations.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to delete videos. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to delete video: ${error.message || "Unknown error"}`);
    }
    
    return false;
  }
};
