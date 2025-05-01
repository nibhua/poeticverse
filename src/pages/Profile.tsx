
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserRound } from "lucide-react";

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

  useEffect(() => {
    if (!username) {
      const redirectToProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();
          
          if (profile?.username) {
            navigate(`/profile/${profile.username}`);
          }
        } else {
          navigate("/login");
        }
      };
      redirectToProfile();
    }
  }, [username, navigate]);

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

  if (profileLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <UserRound className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[70vh] glass-card p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <UserRound className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Profile not found</h2>
          <p className="text-gray-500">The requested profile does not exist.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-6 sm:py-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
    </motion.div>
  );
};

export default Profile;
