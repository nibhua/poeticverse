import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/components/Post";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Edit, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      console.log("Fetching profile for username:", username);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error);
        toast.error("Error loading profile");
        throw error;
      }

      if (!data) {
        toast.error("Profile not found");
        throw new Error("Profile not found");
      }

      return data as Profile;
    },
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      console.log("Fetching posts for user:", profile?.id);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Posts fetch error:", error);
        toast.error("Error loading posts");
        throw error;
      }

      return data as UserPost[];
    },
  });

  // Fetch followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followers', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("followed_id", profile.id);

      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("follower_id", profile.id);

      if (error) throw error;
      return count || 0;
    },
  });

  // Check if current user
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile) {
        setIsCurrentUser(user.id === profile.id);
      }
    };
    checkCurrentUser();
  }, [profile]);

  if (profileLoading) {
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
        {/* Profile Header */}
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

          {/* Profile Info */}
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profile_pic_url || undefined} />
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
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

          {/* Bio Section */}
          <div className="mb-4">
            {profile.full_name && (
              <div className="font-bold">{profile.full_name}</div>
            )}
            {profile.bio && (
              <div className="text-gray-600">{profile.bio}</div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="border-t border-gray-200">
          {postsLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;