import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface PostProps {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrl?: string;
  postId: string;
}

export const Post = ({ username, content, timestamp, likes: initialLikes, comments: initialComments, imageUrl, postId }: PostProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<Array<{ id: string; comment_text: string; username: string }>>([]);

  useEffect(() => {
    checkIfLiked();
    fetchComments();
  }, [postId]);

  const checkIfLiked = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: likeData } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      setIsLiked(!!likeData);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const fetchComments = async () => {
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

      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        setLikes(likes - 1);
      } else {
        await supabase
          .from("likes")
          .insert([{ post_id: postId, user_id: user.id }]);
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
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

      setCommentText("");
      fetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex items-start mb-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
        <div>
          <h3 className="font-semibold">{username}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>
      <p className="text-gray-800 mb-4">{content}</p>
      {imageUrl && (
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt="Post content" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
      <div className="flex items-center space-x-6 text-gray-500">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? 'text-social-primary' : ''}`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span>{likes}</span>
        </button>
        <button 
          className="flex items-center space-x-2"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span>{postComments.length}</span>
        </button>
        <button className="flex items-center space-x-2">
          <Share2 size={20} />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
            />
            <Button onClick={handleComment}>Post</Button>
          </div>
          <div className="space-y-2">
            {postComments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-2 rounded">
                <span className="font-semibold">{comment.username}</span>
                <p className="text-sm">{comment.comment_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};