import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface CommentsProps {
  comments: Array<{ id: string; comment_text: string; username: string }>;
  onAddComment: (text: string) => Promise<void>;
}

export const Comments = ({ comments, onAddComment }: CommentsProps) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    await onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button 
          onClick={handleSubmit}
          size="sm"
          variant="ghost"
          className="text-blue-600 hover:text-blue-700"
        >
          Post
        </Button>
      </div>
      
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-2">
            <Link 
              to={`/profile/${comment.username}`}
              className="font-medium text-sm hover:underline"
            >
              {comment.username}
            </Link>
            <p className="text-sm text-gray-800">{comment.comment_text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};