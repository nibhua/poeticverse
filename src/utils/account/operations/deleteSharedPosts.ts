import { supabase } from "@/integrations/supabase/client";

export const deleteSharedPosts = async (userId: string) => {
  console.log("Deleting shared posts");
  
  try {
    const { error: sharedPostsError } = await supabase
      .from('shared_posts')
      .delete()
      .eq('shared_by_user_id', userId);

    if (sharedPostsError) {
      console.error("Error deleting shared posts:", sharedPostsError);
      throw new Error("Failed to delete shared posts");
    }
  } catch (error) {
    console.error("Error in deleteSharedPosts:", error);
    throw error;
  }
};