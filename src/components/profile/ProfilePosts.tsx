import { Post } from "@/components/Post";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostType {
  id: string;
  content_text: string | null;
  content_type: string;
  created_at: string;
  image_url: string | null;
  caption: string | null;
}

interface ProfilePostsProps {
  posts: PostType[];
  username: string;
}

interface PostWithCounts extends PostType {
  likes: number;
  comments: number;
}

interface LikeRecord {
  post_id: string;
}

interface CommentRecord {
  post_id: string;
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

      const likesCount = (likes as LikeRecord[] | null)?.reduce((acc, curr) => {
        acc[curr.post_id] = (acc[curr.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) throw commentsError;

      const commentsCount = (comments as CommentRecord[] | null)?.reduce((acc, curr) => {
        acc[curr.post_id] = (acc[curr.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return posts.map(post => ({
        ...post,
        likes: likesCount[post.id] || 0,
        comments: commentsCount[post.id] || 0,
      })) as PostWithCounts[];
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
    <div className="max-w-[935px] mx-auto">
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {(postsWithLikes || posts).map((post: PostType | PostWithCounts) => (
          <div key={post.id} className="aspect-square relative">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.caption || "Post"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};