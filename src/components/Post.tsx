import { Heart, MessageCircle, Share2, X, Link2, Mail, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Comments } from "./post/Comments";
import { usePostActions } from "@/hooks/usePostActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);
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

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to share posts");
        return;
      }

      const { error } = await supabase
        .from("shared_posts")
        .insert({
          original_post_id: postId,
          shared_by_user_id: user.id,
          share_caption: shareCaption.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You've already shared this post");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Post shared successfully!");
      setShowShareDialog(false);
      setShareCaption("");
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  const handleExternalShare = async (type: 'whatsapp' | 'gmail' | 'copy') => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    switch (type) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this post: ${postUrl}`)}`, '_blank');
        break;
      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(`Check out this post: ${postUrl}`)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(postUrl);
          toast.success("Link copied to clipboard!");
        } catch (err) {
          toast.error("Failed to copy link");
        }
        break;
    }
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
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <button className="flex items-center space-x-2">
              <Share2 size={20} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Post</DialogTitle>
              <DialogDescription>
                Share this post internally or on other platforms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExternalShare('whatsapp')}
                >
                  <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExternalShare('gmail')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Share via Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExternalShare('copy')}
                >
                  <Copy className="mr-2 h-5 w-5" />
                  Copy Link
                </Button>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Share internally with caption</p>
                <Textarea
                  placeholder="Add a caption to your share (optional)"
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowShareDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    {isSharing ? "Sharing..." : "Share Internally"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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