
import { useState, useEffect } from "react";
import { Comments } from "./post/Comments";
import { usePostActions } from "@/hooks/usePostActions";
import { PostHeader } from "./post/PostHeader";
import { PostImage } from "./post/PostImage";
import { PostActions } from "./post/PostActions";
import { ShareDialog } from "./post/ShareDialog";
import { motion } from "framer-motion";

interface PostProps {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrl?: string;
  postId: string;
  profilePicUrl?: string;
  userId?: string;
}

export const Post = ({ 
  username, 
  content, 
  timestamp, 
  likes: initialLikes, 
  imageUrl,
  postId,
  profilePicUrl,
  userId
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
    handleComment,
    isLoadingActions
  } = usePostActions(postId);

  useEffect(() => {
    setLikes(initialLikes);
    checkIfLiked();
    fetchComments();
  }, [postId, initialLikes, checkIfLiked, fetchComments, setLikes]);

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full mx-auto"
    >
      <PostHeader 
        username={username} 
        timestamp={timestamp}
        profilePicUrl={profilePicUrl}
      />
      
      <div className="px-4 py-2">
        <p className="text-sm text-gray-800 mb-2 leading-relaxed">{content}</p>
      </div>
      
      {imageUrl && <PostImage imageUrl={imageUrl} />}
      
      <div className="px-4 py-3 border-t border-gray-100">
        <PostActions 
          isLiked={isLiked}
          likes={likes}
          comments={postComments.length}
          onLike={handleLike}
          onComment={toggleComments}
          onShare={() => setShowShareDialog(true)}
          isLoading={isLoadingActions}
        />
      </div>
      
      {showComments && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 bg-gray-50/50"
        >
          <Comments 
            comments={postComments}
            onAddComment={handleComment}
          />
        </motion.div>
      )}
      
      <ShareDialog 
        isOpen={showShareDialog} 
        onClose={() => setShowShareDialog(false)}
        postId={postId}
      />
    </motion.div>
  );
};
