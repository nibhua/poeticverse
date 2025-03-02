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
}

export const Post = ({ 
  username, 
  content, 
  timestamp, 
  likes: initialLikes, 
  imageUrl,
  postId,
  profilePicUrl
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-lg mb-4 max-w-[468px] mx-auto shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <PostHeader 
        username={username} 
        timestamp={timestamp}
        profilePicUrl={profilePicUrl}
      />
      
      <div className="px-4 py-2">
        <p className="text-sm text-gray-800 mb-2">{content}</p>
      </div>
      
      {imageUrl && <PostImage imageUrl={imageUrl} />}
      
      <div className="px-4 py-2 border-t border-gray-100">
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
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100"
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