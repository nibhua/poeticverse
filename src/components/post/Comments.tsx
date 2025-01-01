import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CommentsProps {
  comments: Array<{ id: string; comment_text: string; username: string }>;
  onAddComment: (text: string) => Promise<void>;
}

export const Comments = ({ comments, onAddComment }: CommentsProps) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = async () => {
    await onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex space-x-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1"
        />
        <Button onClick={handleSubmit}>Post</Button>
      </div>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-2 rounded">
            <span className="font-semibold">{comment.username}</span>
            <p className="text-sm">{comment.comment_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};