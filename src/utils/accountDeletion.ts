import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteUserData = async (userId: string) => {
  console.log("Starting account deletion process");

  // First delete all likes on user's posts
  console.log("Deleting likes on user's posts");
  const { data: userPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);

  if (userPosts) {
    const postIds = userPosts.map(post => post.id);
    if (postIds.length > 0) {
      const { error: postLikesDeleteError } = await supabase
        .from('likes')
        .delete()
        .in('post_id', postIds);

      if (postLikesDeleteError) {
        console.error("Error deleting post likes:", postLikesDeleteError);
        throw new Error("Failed to delete post likes");
      }
    }
  }

  // Delete user's own likes
  console.log("Deleting user likes");
  const { error: likesDeleteError } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId);

  if (likesDeleteError) {
    console.error("Error deleting likes:", likesDeleteError);
    throw new Error("Failed to delete likes");
  }

  // Delete comments on user's posts and user's comments
  console.log("Deleting comments");
  if (userPosts) {
    const postIds = userPosts.map(post => post.id);
    if (postIds.length > 0) {
      const { error: postCommentsDeleteError } = await supabase
        .from('comments')
        .delete()
        .in('post_id', postIds);

      if (postCommentsDeleteError) {
        console.error("Error deleting post comments:", postCommentsDeleteError);
        throw new Error("Failed to delete post comments");
      }
    }
  }

  const { error: commentsDeleteError } = await supabase
    .from('comments')
    .delete()
    .eq('user_id', userId);

  if (commentsDeleteError) {
    console.error("Error deleting comments:", commentsDeleteError);
    throw new Error("Failed to delete comments");
  }

  // Delete shared posts
  console.log("Deleting shared posts");
  const { error: sharedPostsDeleteError } = await supabase
    .from('shared_posts')
    .delete()
    .eq('shared_by_user_id', userId);

  if (sharedPostsDeleteError) {
    console.error("Error deleting shared posts:", sharedPostsDeleteError);
    throw new Error("Failed to delete shared posts");
  }

  // Delete temporary posts
  console.log("Deleting temporary posts");
  const { error: tempPostsDeleteError } = await supabase
    .from('temporary_posts')
    .delete()
    .eq('user_id', userId);

  if (tempPostsDeleteError) {
    console.error("Error deleting temporary posts:", tempPostsDeleteError);
    throw new Error("Failed to delete temporary posts");
  }

  // Delete posts
  console.log("Deleting user posts");
  const { error: postsDeleteError } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', userId);

  if (postsDeleteError) {
    console.error("Error deleting posts:", postsDeleteError);
    throw new Error("Failed to delete posts");
  }

  // Delete followers/following relationships
  console.log("Deleting follower relationships");
  const { error: followersDeleteError } = await supabase
    .from('followers')
    .delete()
    .or(`follower_id.eq.${userId},followed_id.eq.${userId}`);

  if (followersDeleteError) {
    console.error("Error deleting followers:", followersDeleteError);
    throw new Error("Failed to delete followers");
  }

  // Delete profile
  console.log("Deleting user profile");
  const { error: profileDeleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileDeleteError) {
    console.error("Error deleting profile:", profileDeleteError);
    throw new Error("Failed to delete profile");
  }
};