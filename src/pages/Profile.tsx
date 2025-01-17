import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
}

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      console.log("Fetching profile for username:", username);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      return data as Profile;
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (data) {
      setProfile(data);
      const checkCurrentUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.id === data.id) {
          setIsCurrentUser(true);
        }
      };
      checkCurrentUser();
    }
  }, [data]);

  if (isLoading) {
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
    <div>
      <div className="bg-white">
        <ProfileHeader
          username={profile.username}
          fullName={profile.full_name}
          bio={profile.bio}
          profilePicUrl={profile.profile_pic_url}
          followersCount={0}
          followingCount={0}
          postsCount={0}
          isCurrentUser={isCurrentUser}
          userId={profile.id}
        />
        <ProfilePosts
          posts={[]}
          username={profile.username}
          profilePicUrl={profile.profile_pic_url}
        />
      </div>
    </div>
  );
};

export default Profile;