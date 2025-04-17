import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "@/types/test";
import { toast } from "sonner";

/**
 * Check if Supabase tables exist
 */
const checkSupabaseTables = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("announcements").select("id").limit(1);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error checking Supabase tables:", error);
    return false;
  }
};

/**
 * Fetch all announcements from Supabase
 */
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      console.log("Supabase announcements table doesn't exist yet");
      return [];
    }

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return data.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: announcement.author,
      important: announcement.important
    }));
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    toast.error("Failed to load announcements from Supabase");
    return [];
  }
};

/**
 * Create a new announcement in Supabase
 */
export const createAnnouncement = async (announcement: Omit<Announcement, "id">): Promise<Announcement | null> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      console.error("Supabase announcements table doesn't exist yet");
      toast.error("Failed to create announcement in Supabase");
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

    // Log the announcement being created
    console.log("Creating announcement:", {
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: announcement.author,
      important: announcement.important
    });

    // Create the announcement without requiring authentication
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: announcement.title,
        content: announcement.content,
        date: announcement.date,
        author: announcement.author,
        important: announcement.important,
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

    console.log("Announcement created successfully:", data);
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      date: data.date,
      author: data.author,
      important: data.important
    };
  } catch (error: any) {
    console.error("Error creating announcement:", error);

    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The announcements table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("An announcement with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to create announcements. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to create announcement: ${error.message || "Unknown error"}`);
    }

    return null;
  }
};

/**
 * Update an existing announcement in Supabase
 */
export const updateAnnouncement = async (announcement: Announcement): Promise<boolean> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      console.error("Supabase announcements table doesn't exist yet");
      toast.error("Failed to update announcement in Supabase");
      return false;
    }

    // Log the announcement being updated
    console.log("Updating announcement:", {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: announcement.author,
      important: announcement.important
    });

    const { error } = await supabase
      .from("announcements")
      .update({
        title: announcement.title,
        content: announcement.content,
        date: announcement.date,
        author: announcement.author,
        important: announcement.important,
        updated_at: new Date().toISOString(),
      })
      .eq("id", announcement.id);

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Announcement updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating announcement:", error);

    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The announcements table doesn't exist. Please run the database migrations.");
    } else if (error.code === "23505") {
      toast.error("An announcement with this title already exists.");
    } else if (error.code === "23503") {
      toast.error("Foreign key constraint failed. The user may not exist.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to update announcements. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to update announcement: ${error.message || "Unknown error"}`);
    }

    return false;
  }
};

/**
 * Delete an announcement from Supabase
 */
export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  try {
    // Check if Supabase tables exist
    const tablesExist = await checkSupabaseTables();
    if (!tablesExist) {
      console.error("Supabase announcements table doesn't exist yet");
      toast.error("Failed to delete announcement from Supabase");
      return false;
    }

    // Log the announcement being deleted
    console.log("Deleting announcement with ID:", id);

    const { error } = await supabase
      .from("announcements")
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

    console.log("Announcement deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting announcement:", error);

    // Provide more specific error messages based on the error
    if (error.code === "42P01") {
      toast.error("The announcements table doesn't exist. Please run the database migrations.");
    } else if (error.code === "42501") {
      toast.error("You don't have permission to delete announcements. Please check your RLS policies.");
    } else if (error.message && error.message.includes("JWT")) {
      toast.error("Authentication error. Please log in again.");
    } else {
      toast.error(`Failed to delete announcement: ${error.message || "Unknown error"}`);
    }

    return false;
  }
};
