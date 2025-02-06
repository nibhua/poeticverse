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

  // Simple auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUserId(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  // Fetch posts from followed users
  const { data: followedPosts = [] } = useQuery({
    queryKey: ['followed-posts', userId],
    queryFn: async () => {
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
  });

  // Fetch random posts
  const { data: randomPosts = [] } = useQuery({
    queryKey: ['random-posts', userId],
    queryFn: async () => {
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
  });

  if (!userId) return null;

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