import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";

const Profile = () => {
  const { username } = useParams();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const navigate = useNavigate();

  // If no username provided, redirect to current user's profile
  useEffect(() => {
    const redirectToUserProfile = async () => {
      if (!username) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          navigate(`/profile/${profile.username}`);
        }
      }
    };
    redirectToUserProfile();
  }, [username, navigate]);

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

      return data;
    },
    enabled: !!username,
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

      return data;
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
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <div className="bg-white">
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
        
        {postsLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : (
          <ProfilePosts posts={posts} username={profile.username} profilePicUrl={profile.profile_pic_url} />
        )}
      </div>
    </div>
  );
};

export default Profile;