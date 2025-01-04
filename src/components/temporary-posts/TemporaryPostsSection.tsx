import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TemporaryPostViewer } from "./TemporaryPostViewer";
import { toast } from "sonner";

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

export const TemporaryPostsSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TemporaryPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<TemporaryPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemporaryPosts();
    subscribeToUpdates();
  }, []);

  const fetchTemporaryPosts = async () => {
    try {
      console.log("Fetching temporary posts");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First fetch posts from followed users
      const { data: followedUsers } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', user.id);

      const followedIds = followedUsers?.map(f => f.followed_id) || [];
      
      const { data: posts, error } = await supabase
        .from('temporary_posts')
        .select(`
          *,
          user:profiles!temporary_posts_user_id_fkey (
            username,
            profile_pic_url
          )
        `)
        .or(`user_id.in.(${followedIds.join(',')}),user_id.neq.${user.id}`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(posts);
    } catch (error) {
      console.error("Error fetching temporary posts:", error);
      toast.error("Failed to load temporary posts");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('temporary-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'temporary_posts'
        },
        () => {
          fetchTemporaryPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 overflow-x-auto p-4 scrollbar-hide">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14 flex-shrink-0"
          onClick={() => navigate("/create")}
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        {posts.map((post) => (
          <button
            key={post.id}
            className="flex-shrink-0 group relative"
            onClick={() => setSelectedPost(post)}
          >
            {post.user.profile_pic_url ? (
              <img
                src={post.user.profile_pic_url}
                alt={post.user.username}
                className="w-14 h-14 rounded-full border-2 border-primary"
              />
            ) : (
              <Circle className="w-14 h-14 text-gray-400" />
            )}
            <span className="text-xs mt-1 block text-center truncate w-14">
              {post.user.username}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedPost && (
            <TemporaryPostViewer post={selectedPost} onClose={() => setSelectedPost(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};