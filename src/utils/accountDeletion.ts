import { supabase } from "@/integrations/supabase/client";

export const deleteUserData = async (userId: string) => {
  console.log("Starting account deletion process");

  try {
    // First delete all likes on user's posts
    console.log("Deleting likes on user's posts");
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

    // Delete comments on user's posts and user's comments
    console.log("Deleting comments");
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

    // Delete shared posts
    console.log("Deleting shared posts");
    const { error: sharedPostsError } = await supabase
      .from('shared_posts')
      .delete()
      .eq('shared_by_user_id', userId);

    if (sharedPostsError) {
      console.error("Error deleting shared posts:", sharedPostsError);
      throw new Error("Failed to delete shared posts");
    }

    // Delete temporary posts
    console.log("Deleting temporary posts");
    const { error: tempPostsError } = await supabase
      .from('temporary_posts')
      .delete()
      .eq('user_id', userId);

    if (tempPostsError) {
      console.error("Error deleting temporary posts:", tempPostsError);
      throw new Error("Failed to delete temporary posts");
    }

    // Now it's safe to delete posts since all references have been removed
    console.log("Deleting user posts");
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId);

    if (postsError) {
      console.error("Error deleting posts:", postsError);
      throw new Error("Failed to delete posts");
    }

    // Delete followers/following relationships
    console.log("Deleting follower relationships");
    const { error: followersError } = await supabase
      .from('followers')
      .delete()
      .or(`follower_id.eq.${userId},followed_id.eq.${userId}`);

    if (followersError) {
      console.error("Error deleting followers:", followersError);
      throw new Error("Failed to delete followers");
    }

    // Finally, delete profile
    console.log("Deleting user profile");
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      throw new Error("Failed to delete profile");
    }
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
};