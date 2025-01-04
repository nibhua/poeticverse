import { useState, useEffect } from "react";
import { Comments } from "./post/Comments";
import { usePostActions } from "@/hooks/usePostActions";
import { PostHeader } from "./post/PostHeader";
import { PostImage } from "./post/PostImage";
import { PostActions } from "./post/PostActions";
import { ShareDialog } from "./post/ShareDialog";

interface PostProps {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrl?: string;
  postId: string;
}

export const Post = ({ 
  username, 
  content, 
  timestamp, 
  likes: initialLikes, 
  imageUrl, 
  postId 
}: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const {
    isLiked,
    likes,
    setLikes,
    postComments,
    checkIfLiked,
    fetchComments,
    handleLike,
    handleComment
  } = usePostActions(postId);

  useEffect(() => {
    setLikes(initialLikes);
    checkIfLiked();
    fetchComments();
  }, [postId, initialLikes]);

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <PostHeader username={username} timestamp={timestamp} />
      <p className="text-gray-800 mb-4">{content}</p>
      {imageUrl && <PostImage imageUrl={imageUrl} />}
      <PostActions 
        isLiked={isLiked}
        likes={likes}
        comments={postComments.length}
        onLike={handleLike}
        onComment={() => setShowComments(!showComments)}
        onShare={() => setShowShareDialog(true)}
      />
      {showComments && (
        <Comments 
          comments={postComments}
          onAddComment={handleComment}
        />
      )}
      <ShareDialog 
        isOpen={showShareDialog} 
        onClose={() => setShowShareDialog(false)}
        postId={postId}
      />
    </div>
  );
};