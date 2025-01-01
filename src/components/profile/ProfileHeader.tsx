import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, LogOut, Settings, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileHeaderProps {
  username: string;
  fullName: string | null;
  bio: string | null;
  profilePicUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isCurrentUser: boolean;
  userId: string;
}

export const ProfileHeader = ({
  username,
  fullName,
  bio,
  profilePicUrl,
  followersCount,
  followingCount,
  postsCount,
  isCurrentUser,
  userId,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(followersCount);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleFollowToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to follow users");
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", userId);

        if (error) throw error;
        setFollowerCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from("followers")
          .insert([{ follower_id: user.id, followed_id: userId }]);

        if (error) throw error;
        setFollowerCount(prev => prev + 1);
      }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{username}</h1>
        {isCurrentUser ? (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/profile/${username}/edit`)}
            >
              <Edit className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteAccount} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            onClick={handleFollowToggle}
            variant={isFollowing ? "outline" : "default"}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profilePicUrl || undefined} />
          <AvatarFallback>
            <UserRound className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="font-bold">{postsCount}</div>
            <div className="text-gray-600 text-sm">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{followerCount}</div>
            <div className="text-gray-600 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{followingCount}</div>
            <div className="text-gray-600 text-sm">Following</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        {fullName && (
          <div className="font-bold">{fullName}</div>
        )}
        {bio && (
          <div className="text-gray-600">{bio}</div>
        )}
      </div>
    </div>
  );
};