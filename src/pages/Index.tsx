import { Post } from "@/components/Post";
import { BottomNav } from "@/components/BottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch posts from followed users first
  const { data: followedPosts = [], isLoading: followedPostsLoading } = useQuery({
    queryKey: ['followed-posts', userId],
    enabled: !!userId,
    queryFn: async () => {
      console.log("Fetching posts from followed users");
      const { data: followedUsers } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', userId);

      if (!followedUsers?.length) return [];

      const followedIds = followedUsers.map(f => f.followed_id);
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching followed posts:", error);
        throw error;
      }

      return posts;
    },
  });

  // Fetch random posts from other users
  const { data: randomPosts = [], isLoading: randomPostsLoading } = useQuery({
    queryKey: ['random-posts', userId],
    enabled: !!userId,
    queryFn: async () => {
      console.log("Fetching random posts");
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .not('user_id', 'eq', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching random posts:", error);
        throw error;
      }

      return posts;
    },
  });

  if (followedPostsLoading || randomPostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const allPosts = [...(followedPosts || []), ...(randomPosts || [])];

  return (
    <div className="pb-20">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-center">Home</h1>
      </header>
      <main className="max-w-lg mx-auto">
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
              likes={0}
              comments={0}
            />
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;