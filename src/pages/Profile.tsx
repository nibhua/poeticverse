import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
}

interface Post {
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      console.log("Fetching profile for username:", username);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile");
        throw error;
      }

      return profiles as Profile;
    },
    enabled: !!username,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profile?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        toast.error("Error loading posts");
        throw error;
      }

      return data as Post[];
    },
    enabled: !!profile?.id,
  });

  const { data: followersCount = 0 } = useQuery({
    queryKey: ["followers", profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("followed_id", profile?.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following", profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("follower_id", profile?.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && profile) {
        setIsCurrentUser(session.user.id === profile.id);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-gray-500">The requested profile does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        username={profile.username}
        fullName={profile.full_name}
        bio={profile.bio}
        profilePicUrl={profile.profile_pic_url}
        followersCount={followersCount}
        followingCount={followingCount}
        postsCount={posts.length}
        isCurrentUser={isCurrentUser}
        userId={profile.id}
      />
      <ProfilePosts
        posts={posts}
        username={profile.username}
        profilePicUrl={profile.profile_pic_url}
      />
    </div>
  );
};

export default Profile;