import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const ShareDialog = ({ isOpen, onClose, postId }: ShareDialogProps) => {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/post/${postId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The post link has been copied to your clipboard.",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=Check out this post&body=${encodeURIComponent(shareUrl)}`;
    window.location.href = emailUrl;
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Share Post</SheetTitle>
          <SheetDescription>
            Share this post with your friends
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </Button>
          <Button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <Mail className="h-4 w-4" />
            Share via Email
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};