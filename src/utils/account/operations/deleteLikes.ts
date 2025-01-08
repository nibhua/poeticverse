import { supabase } from "@/integrations/supabase/client";

export const deleteLikes = async (userId: string) => {
  console.log("Deleting likes on user's posts");
  
  try {
    // First delete all likes on user's posts
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (userPosts) {
      const postIds = userPosts.map(post => post.id);
      if (postIds.length > 0) {
        const { error: likesOnPostsError } = await supabase
          .from('likes')
          .delete()
          .in('post_id', postIds);

        if (likesOnPostsError) {
          console.error("Error deleting likes on posts:", likesOnPostsError);
          throw new Error("Failed to delete likes on posts");
        }
      }
    }

    // Delete user's own likes
    console.log("Deleting user likes");
    const { error: userLikesError } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId);

    if (userLikesError) {
      console.error("Error deleting user likes:", userLikesError);
      throw new Error("Failed to delete user likes");
    }
  } catch (error) {
    console.error("Error in deleteLikes:", error);
    throw error;
  }
};