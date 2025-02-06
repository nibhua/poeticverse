import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/Post";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserId(session.user.id);
  }, [navigate]);

  const { data: followedPosts = [] } = useQuery({
    queryKey: ['followed-posts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: followedUsers } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', userId);

      if (!followedUsers?.length) return [];

      const followedIds = followedUsers.map(f => f.followed_id);

      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(10);

      return posts || [];
    },
    enabled: !!userId,
  });

  const { data: randomPosts = [] } = useQuery({
    queryKey: ['random-posts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      return posts || [];
    },
    enabled: !!userId,
  });

  if (!userId) return null;

  const allPosts = [...followedPosts, ...randomPosts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-4 pb-20">
      {allPosts.length > 0 ? (
        allPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Follow some users to see their posts here!
        </div>
      )}
    </div>
  );
}