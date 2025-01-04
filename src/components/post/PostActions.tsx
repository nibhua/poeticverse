import { Heart, MessageCircle, Share2 } from "lucide-react";

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
      <button 
        onClick={onLike}
        className={`flex items-center space-x-2 ${isLiked ? 'text-social-primary' : ''}`}
      >
        <Heart size={20} className={isLiked ? 'fill-current' : ''} />
        <span>{likes}</span>
      </button>
      <button 
        className="flex items-center space-x-2"
        onClick={onComment}
      >
        <MessageCircle size={20} />
        <span>{comments}</span>
      </button>
      <button 
        className="flex items-center space-x-2"
        onClick={onShare}
      >
        <Share2 size={20} />
      </button>
    </div>
  );
};