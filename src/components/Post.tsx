import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Comments } from "./post/Comments";
import { usePostActions } from "@/hooks/usePostActions";

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
        <Comments 
          comments={postComments}
          onAddComment={handleComment}
        />
      )}
    </div>
  );
};