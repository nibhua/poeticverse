import { supabase } from "@/integrations/supabase/client";

export const deletePosts = async (userId: string) => {
  console.log("Deleting user posts");
  
  try {
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId);

    if (postsError) {
      console.error("Error deleting posts:", postsError);
      throw new Error("Failed to delete posts");
    }
  } catch (error) {
    console.error("Error in deletePosts:", error);
    throw error;
  }
};