import { supabase } from "@/integrations/supabase/client";

export const deleteTemporaryPosts = async (userId: string) => {
  console.log("Deleting temporary posts");
  
  try {
    const { error: tempPostsError } = await supabase
      .from('temporary_posts')
      .delete()
      .eq('user_id', userId);

    if (tempPostsError) {
      console.error("Error deleting temporary posts:", tempPostsError);
      throw new Error("Failed to delete temporary posts");
    }
  } catch (error) {
    console.error("Error in deleteTemporaryPosts:", error);
    throw error;
  }
};