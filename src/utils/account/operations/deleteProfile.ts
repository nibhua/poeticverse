import { supabase } from "@/integrations/supabase/client";

export const deleteProfile = async (userId: string) => {
  console.log("Deleting user profile");
  
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      throw new Error("Failed to delete profile");
    }
  } catch (error) {
    console.error("Error in deleteProfile:", error);
    throw error;
  }
};