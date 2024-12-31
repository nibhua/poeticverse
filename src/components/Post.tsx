import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface PostProps {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export const Post = ({ username, content, timestamp, likes: initialLikes, comments }: PostProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
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
      <div className="flex items-center space-x-6 text-gray-500">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? 'text-social-primary' : ''}`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span>{likes}</span>
        </button>
        <button className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span>{comments}</span>
        </button>
        <button className="flex items-center space-x-2">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};