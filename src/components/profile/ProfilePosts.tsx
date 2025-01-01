import { Post } from "@/components/Post";

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
  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No posts yet
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      {posts.map((post) => (
        <Post
          key={post.id}
          username={username}
          content={post.content_text || post.caption || ""}
          timestamp={new Date(post.created_at).toLocaleDateString()}
          imageUrl={post.image_url}
          likes={0}
          comments={0}
        />
      ))}
    </div>
  );
};