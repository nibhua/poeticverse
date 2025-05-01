
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const usePostActions = (postId: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [postComments, setPostComments] = useState<Array<{ id: string; comment_text: string; username: string }>>([]);
  const queryClient = useQueryClient();

  const checkIfLiked = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
  }, [postId]);

  const fetchComments = useCallback(async () => {
    try {
      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          id,
          comment_text,
          profiles:user_id (username)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      setPostComments(comments.map(comment => ({
        id: comment.id,
        comment_text: comment.comment_text,
        username: comment.profiles.username
      })));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postId]);

  const handleLike = async () => {
    try {
      setIsLoadingActions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to like posts");
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
      
      // Invalidate queries to update like counts everywhere
      queryClient.invalidateQueries({ queryKey: ['followed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['random-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts-with-likes'] });
      queryClient.invalidateQueries({ queryKey: ['home-posts'] });
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
    } finally {
      setIsLoadingActions(false);
    }
  };

  const handleComment = async (commentText: string) => {
    if (!commentText.trim()) return;

    try {
      setIsLoadingActions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to comment");
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
    } finally {
      setIsLoadingActions(false);
    }
  };

  // Set up real-time subscription for likes and comments
  useEffect(() => {
    const likesChannel = supabase
      .channel(`public:likes:${postId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${postId}` },
        () => {
          checkIfLiked();
          queryClient.invalidateQueries({ queryKey: ['posts-with-likes'] });
          queryClient.invalidateQueries({ queryKey: ['home-posts'] });
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`public:comments:${postId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [postId, checkIfLiked, fetchComments, queryClient]);

  return {
    isLiked,
    likes,
    setLikes,
    postComments,
    checkIfLiked,
    fetchComments,
    handleLike,
    handleComment,
    isLoadingActions
  };
};
