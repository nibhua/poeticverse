
import { supabase } from "@/integrations/supabase/client";

export const deleteUserData = async (userId: string) => {
  console.log("Starting account deletion process");

  try {
    // Delete all likes on user's posts and user's own likes
    console.log("Deleting likes");
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map(post => post.id);
      
      // Delete likes on user's posts
      await supabase
        .from('likes')
        .delete()
        .in('post_id', postIds);
    }

    // Delete user's own likes
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId);

    // Delete comments on user's posts and user's comments
    console.log("Deleting comments");
    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map(post => post.id);
      
      // Delete comments on user's posts
      await supabase
        .from('comments')
        .delete()
        .in('post_id', postIds);
    }

    // Delete user's own comments
    await supabase
      .from('comments')
      .delete()
      .eq('user_id', userId);

    // Delete shared posts
    console.log("Deleting shared posts");
    await supabase
      .from('shared_posts')
      .delete()
      .eq('shared_by_user_id', userId);

    // Delete workshop registrations
    console.log("Deleting workshop registrations");
    await supabase
      .from('workshop_registrations')
      .delete()
      .eq('user_id', userId);

    // Delete temporary posts
    console.log("Deleting temporary posts");
    await supabase
      .from('temporary_posts')
      .delete()
      .eq('user_id', userId);

    // Delete user's posts (now that all references have been removed)
    console.log("Deleting user posts");
    await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId);

    // Delete followers/following relationships
    console.log("Deleting follower relationships");
    await supabase
      .from('followers')
      .delete()
      .or(`follower_id.eq.${userId},followed_id.eq.${userId}`);

    // Delete profile last
    console.log("Deleting user profile");
    await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    return true;
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
};
