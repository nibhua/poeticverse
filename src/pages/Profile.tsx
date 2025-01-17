import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { data, isLoading } = useQuery(["profile", username], async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  });

  useEffect(() => {
    if (data) {
      setProfile(data);
      const user = supabase.auth.user();
      if (user && user.id === data.id) {
        setIsOwnProfile(true);
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
          isOwnProfile={isOwnProfile}
          userId={profile.id}
        />
        <ProfilePosts userId={profile.id} />
      </div>
    </div>
  );
};

export default Profile;
