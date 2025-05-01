
import { Post } from "@/components/Post";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  profilePicUrl?: string;
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

export const ProfilePosts = ({ posts, username, profilePicUrl }: ProfilePostsProps) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (posts.length === 0) {
    return (
      <motion.div 
        className="glass-card p-12 text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PenSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">No posts yet</h3>
        <p className="text-gray-500 mb-6">Share your first post with the world</p>
        
        <Button className="btn-gradient" asChild>
          <Link to="/create-post">Create a Post</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full max-w-[600px] mx-auto mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-6">
        {(postsWithLikes || posts).map((post: PostType | PostWithCounts, index) => (
          <motion.div 
            key={post.id} 
            variants={itemVariants}
            className="transform-preserve-3d perspective-1000 hover-scale"
          >
            <Post
              postId={post.id}
              username={username}
              content={post.content_text || post.caption || ""}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              imageUrl={post.image_url || undefined}
              likes={'likes' in post ? post.likes : 0}
              comments={'comments' in post ? post.comments : 0}
              profilePicUrl={profilePicUrl}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
