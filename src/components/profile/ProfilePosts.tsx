import { Post } from "@/components/Post";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePostsProps {
  posts: Array<{
    id: string;
    content_text: string | null;
    content_type: string;
    created_at: string;
    image_url: string | null;
    caption: string | null;
  }>;
  username: string;
}

export const ProfilePosts = ({ posts, username }: ProfilePostsProps) => {
  const { data: postsWithLikes } = useQuery({
    queryKey: ['posts-with-likes', posts.map(p => p.id)],
    queryFn: async () => {
      const postIds = posts.map(p => p.id);
      const { data: likes, error } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);

      if (error) throw error;

      const likesCount = likes?.reduce((acc, curr) => {
        acc[curr.post_id] = (acc[curr.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) throw commentsError;

      const commentsCount = comments?.reduce((acc, curr) => {
        acc[curr.post_id] = (acc[curr.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return posts.map(post => ({
        ...post,
        likes: likesCount[post.id] || 0,
        comments: commentsCount[post.id] || 0,
      }));
    },
  });

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No posts yet
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      {(postsWithLikes || posts).map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          username={username}
          content={post.content_text || post.caption || ""}
          timestamp={new Date(post.created_at).toLocaleDateString()}
          imageUrl={post.image_url}
          likes={'likes' in post ? post.likes : 0}
          comments={'comments' in post ? post.comments : 0}
        />
      ))}
    </div>
  );
};