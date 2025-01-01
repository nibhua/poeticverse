import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/components/Post";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Settings, Edit } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
}

interface UserPost {
  id: string;
  content_text: string | null;
  content_type: string;
  created_at: string;
  image_url: string | null;
  caption: string | null;
}

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (profileError) {
          toast.error("Error loading profile");
          return;
        }

        setProfile(profileData);
        setIsCurrentUser(user?.id === profileData.id);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        if (postsError) {
          toast.error("Error loading posts");
          return;
        }

        setPosts(postsData || []);

        // Fetch followers count
        const { count: followers, error: followersError } = await supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("followed_id", profileData.id);

        if (!followersError) {
          setFollowersCount(followers || 0);
        }

        // Fetch following count
        const { count: following, error: followingError } = await supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", profileData.id);

        if (!followingError) {
          setFollowingCount(following || 0);
        }

      } catch (error) {
        console.error("Error:", error);
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold mb-4">Profile not found</h1>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{profile.username}</h1>
            {isCurrentUser && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/profile/${username}/edit`)}
              >
                <Edit className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profile_pic_url || undefined} />
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
            {profile.full_name && (
              <div className="font-bold">{profile.full_name}</div>
            )}
            {profile.bio && (
              <div className="text-gray-600">{profile.bio}</div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200">
          {posts.map((post) => (
            <Post
              key={post.id}
              username={profile.username}
              content={post.content_text || post.caption || ""}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              imageUrl={post.image_url}
              likes={0}
              comments={0}
            />
          ))}
          {posts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No posts yet
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;