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
    <div className="bg-white border border-gray-200 rounded-lg mb-4 max-w-[600px] mx-auto">
      <PostHeader username={username} timestamp={timestamp} />
      <div className="px-4 py-2">
        <p className="text-sm text-gray-800 mb-2">{content}</p>
      </div>
      {imageUrl && <PostImage imageUrl={imageUrl} />}
      <div className="px-4 py-2">
        <PostActions 
          isLiked={isLiked}
          likes={likes}
          comments={postComments.length}
          onLike={handleLike}
          onComment={() => setShowComments(!showComments)}
          onShare={() => setShowShareDialog(true)}
        />
      </div>
      {showComments && (
        <div className="border-t border-gray-100">
          <Comments 
            comments={postComments}
            onAddComment={handleComment}
          />
        </div>
      )}
      <ShareDialog 
        isOpen={showShareDialog} 
        onClose={() => setShowShareDialog(false)}
        postId={postId}
      />
    </div>
  );
};