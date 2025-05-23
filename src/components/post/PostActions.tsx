
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface PostActionsProps {
  isLiked: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  isLoading?: boolean;
}

export const PostActions = ({
  isLiked,
  likes,
  comments,
  onLike,
  onComment,
  onShare,
  isLoading = false
}: PostActionsProps) => {
  return (
    <div className="flex items-center space-x-6 text-gray-500">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''} ${isLoading ? 'opacity-50' : ''}`}
      >
        <Heart size={20} className={isLiked ? 'fill-current' : ''} />
        <span className="text-sm">{likes}</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2"
        onClick={onComment}
        disabled={isLoading}
      >
        <MessageCircle size={20} />
        <span className="text-sm">{comments}</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2"
        onClick={onShare}
        disabled={isLoading}
      >
        <Share2 size={20} />
      </motion.button>
    </div>
  );
};
