import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePostActions = (postId: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [postComments, setPostComments] = useState<Array<{ id: string; comment_text: string; username: string }>>([]);

  const checkIfLiked = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: postExists } = await supabase
        .from("posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (!postExists) {
        console.error("Post does not exist:", postId);
        return;
      }

      const { data: likeData } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsLiked(!!likeData);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: postExists } = await supabase
        .from("posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (!postExists) {
        console.error("Post does not exist:", postId);
        return;
      }

      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          id,
          comment_text,
          profiles:user_id (username)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setPostComments(comments.map(comment => ({
        id: comment.id,
        comment_text: comment.comment_text,
        username: comment.profiles.username
      })));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to like posts");
        return;
      }

      const { data: postExists } = await supabase
        .from("posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (!postExists) {
        toast.error("Cannot like this post");
        return;
      }

      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        setLikes(prev => prev - 1);
      } else {
        await supabase
          .from("likes")
          .insert([{ post_id: postId, user_id: user.id }]);
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleComment = async (commentText: string) => {
    if (!commentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to comment");
        return;
      }

      const { data: postExists } = await supabase
        .from("posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (!postExists) {
        toast.error("Cannot comment on this post");
        return;
      }

      const { error } = await supabase
        .from("comments")
        .insert([{
          post_id: postId,
          user_id: user.id,
          comment_text: commentText.trim()
        }]);

      if (error) throw error;

      fetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return {
    isLiked,
    likes,
    setLikes,
    postComments,
    checkIfLiked,
    fetchComments,
    handleLike,
    handleComment
  };
};