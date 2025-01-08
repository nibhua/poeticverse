import { supabase } from "@/integrations/supabase/client";

export const deleteFollowers = async (userId: string) => {
  console.log("Deleting follower relationships");
  
  try {
    const { error: followersError } = await supabase
      .from('followers')
      .delete()
      .or(`follower_id.eq.${userId},followed_id.eq.${userId}`);

    if (followersError) {
      console.error("Error deleting followers:", followersError);
      throw new Error("Failed to delete followers");
    }
  } catch (error) {
    console.error("Error in deleteFollowers:", error);
    throw error;
  }
};