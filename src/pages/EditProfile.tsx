import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    bio: "",
    profile_pic_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          profile_pic_url: data.profile_pic_url || "",
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          profile_pic_url: profile.profile_pic_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate(`/profile/${profile.username}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.profile_pic_url || undefined} />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Profile picture upload coming soon!")}
          >
            Change Profile Picture
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/profile/${profile.username}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;