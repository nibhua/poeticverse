import { supabase } from "@/integrations/supabase/client";

export const deletePosts = async (userId: string) => {
  console.log("Deleting user posts");
  
  try {
    // First get all posts by the user
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map(post => post.id);

      // Delete all likes on these posts first
      console.log("Deleting likes on posts before deleting posts");
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .in('post_id', postIds);

      if (likesError) {
        console.error("Error deleting likes on posts:", likesError);
        throw new Error("Failed to delete likes on posts");
      }

      // Delete all comments on these posts
      console.log("Deleting comments on posts before deleting posts");
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('post_id', postIds);

      if (commentsError) {
        console.error("Error deleting comments on posts:", commentsError);
        throw new Error("Failed to delete comments on posts");
      }

      // Now we can safely delete the posts
      console.log("Now deleting the posts themselves");
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('user_id', userId);

      if (postsError) {
        console.error("Error deleting posts:", postsError);
        throw new Error("Failed to delete posts");
      }
    }
  } catch (error) {
    console.error("Error in deletePosts:", error);
    throw error;
  }
};