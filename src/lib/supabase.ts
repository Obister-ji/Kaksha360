
// This file is now deprecated - use the one from integrations/supabase/client instead
import { supabase } from "@/integrations/supabase/client";

// Re-export for backward compatibility
export const supabaseClient = supabase;
export const isSupabaseConfigured = () => true;
