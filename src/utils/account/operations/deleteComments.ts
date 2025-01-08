import { supabase } from "@/integrations/supabase/client";

export const deleteComments = async (userId: string) => {
  console.log("Deleting comments");
  
  try {
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (userPosts) {
      const postIds = userPosts.map(post => post.id);
      if (postIds.length > 0) {
        const { error: commentsOnPostsError } = await supabase
          .from('comments')
          .delete()
          .in('post_id', postIds);

        if (commentsOnPostsError) {
          console.error("Error deleting comments on posts:", commentsOnPostsError);
          throw new Error("Failed to delete comments on posts");
        }
      }
    }

    const { error: userCommentsError } = await supabase
      .from('comments')
      .delete()
      .eq('user_id', userId);

    if (userCommentsError) {
      console.error("Error deleting user comments:", userCommentsError);
      throw new Error("Failed to delete user comments");
    }
  } catch (error) {
    console.error("Error in deleteComments:", error);
    throw error;
  }
};