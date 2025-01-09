import { Heart, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface PostActionsProps {
  isLiked: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export const PostActions = ({
  isLiked,
  likes,
  comments,
  onLike,
  onComment,
  onShare
}: PostActionsProps) => {
  return (
    <div className="flex items-center space-x-6 text-gray-500">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
      >
        <Heart size={20} className={isLiked ? 'fill-current' : ''} />
        <span className="text-sm">{likes}</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2"
        onClick={onComment}
      >
        <MessageCircle size={20} />
        <span className="text-sm">{comments}</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2"
        onClick={onShare}
      >
        <Share2 size={20} />
      </motion.button>
    </div>
  );
};