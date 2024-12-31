import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/components/Post";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  username: string;
  full_name: string;
  bio: string;
  profile_pic_url: string;
}

interface UserPost {
  id: string;
  content_text: string;
  created_at: string;
  username: string;
}

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) throw error;
        setProfile(data);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, content_text, created_at, profiles(username)")
          .eq("user_id", data.id)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData);

        // Fetch followers count
        const { count: followers, error: followersError } = await supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("followed_id", data.id);

        if (followersError) throw followersError;
        setFollowersCount(followers || 0);

        // Fetch following count
        const { count: following, error: followingError } = await supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", data.id);

        if (followingError) throw followingError;
        setFollowingCount(following || 0);
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pb-20">
      <div className="bg-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profile_pic_url} />
              <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="font-bold">{posts.length}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{followersCount}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{followingCount}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold">{profile.full_name}</div>
            <div className="text-gray-600">{profile.bio}</div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {posts.map((post) => (
            <Post
              key={post.id}
              username={post.username}
              content={post.content_text}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              likes={0}
              comments={0}
            />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;