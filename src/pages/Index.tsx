import { useEffect, useState } from "react";
import { Post } from "@/components/Post";
import { TemporaryPostsSection } from "@/components/temporary-posts/TemporaryPostsSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth status once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        setUserId(session.user.id);
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication error. Please try logging in again.");
        navigate('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (session) {
        setUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch posts from followed users
  const { data: followedPosts = [], isLoading: followedPostsLoading } = useQuery({
    queryKey: ['followed-posts', userId],
    queryFn: async () => {
      console.log("Fetching posts from followed users for userId:", userId);
      if (!userId) return [];

      const { data: followedUsers, error: followError } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', userId);

      if (followError) {
        console.error("Error fetching followed users:", followError);
        return [];
      }

      if (!followedUsers?.length) return [];

      const followedIds = followedUsers.map(f => f.followed_id);
      
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            profile_pic_url
          ),
          likes:likes (count)
        `)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) {
        console.error("Error fetching followed posts:", postsError);
        return [];
      }

      return posts.map(post => ({
        ...post,
        likes: post.likes[0]?.count || 0
      }));
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Fetch random posts
  const { data: randomPosts = [], isLoading: randomPostsLoading } = useQuery({
    queryKey: ['random-posts', userId],
    queryFn: async () => {
      console.log("Fetching random posts");
      if (!userId) return [];

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            profile_pic_url
          ),
          likes:likes (count)
        `)
        .not('user_id', 'eq', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching random posts:", error);
        return [];
      }

      return posts.map(post => ({
        ...post,
        likes: post.likes[0]?.count || 0
      }));
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Show loading state only when actively fetching data
  if (!userId) {
    return null; // Don't show loading state during initial auth check
  }

  if (followedPostsLoading && randomPostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const allPosts = [...(followedPosts || []), ...(randomPosts || [])];

  return (
    <div>
      <header className="sticky top-0 bg-white border-b p-4 z-10">
        <h1 className="text-xl font-bold text-center">Home</h1>
      </header>
      <main className="max-w-lg mx-auto">
        <TemporaryPostsSection />
        {allPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No posts yet. Follow some users to see their posts here!
          </div>
        ) : (
          allPosts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              username={post.profiles.username}
              content={post.content_text || post.caption || ""}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              imageUrl={post.image_url}
              likes={post.likes}
              comments={0}
              profilePicUrl={post.profiles.profile_pic_url}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Index;