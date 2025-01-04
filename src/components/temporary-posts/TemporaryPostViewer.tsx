import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemporaryPost {
  id: string;
  content_type: string;
  content_text: string | null;
  image_url: string | null;
  user: {
    username: string;
    profile_pic_url: string | null;
  };
}

interface Props {
  post: TemporaryPost;
  onClose: () => void;
}

export const TemporaryPostViewer = ({ post, onClose }: Props) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        {post.user.profile_pic_url && (
          <img
            src={post.user.profile_pic_url}
            alt={post.user.username}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="font-semibold">{post.user.username}</span>
      </div>

      {post.content_type === 'image' && post.image_url && (
        <img
          src={post.image_url}
          alt="Temporary post"
          className="w-full h-auto rounded-lg"
        />
      )}

      {post.content_text && (
        <p className="mt-4 text-gray-800">{post.content_text}</p>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};