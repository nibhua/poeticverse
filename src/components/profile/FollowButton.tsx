
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowersCount: number;
  onFollowersCountChange: (count: number) => void;
  isCurrentUser?: boolean;
}

export const FollowButton = ({ 
  userId, 
  initialFollowersCount, 
  onFollowersCountChange,
  isCurrentUser = false
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserSelf, setIsUserSelf] = useState(isCurrentUser);

  useEffect(() => {
    const checkAuthAndFollowStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setCurrentUserId(user.id);
        
        // Don't check follow status if it's the current user's profile
        if (user.id === userId) {
          setIsUserSelf(true);
          return;
        }

        const { data, error } = await supabase
          .from("followers")
          .select("*")
          .eq("follower_id", user.id)
          .eq("followed_id", userId)
          .maybeSingle();

        if (error) throw error;
        setIsFollowing(!!data);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkAuthAndFollowStatus();
  }, [userId]);

  // Update follower count whenever it changes
  useEffect(() => {
    setFollowerCount(initialFollowersCount);
  }, [initialFollowersCount]);

  const handleFollowToggle = async () => {
    // Prevent following yourself
    if (isUserSelf || userId === currentUserId) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    try {
      setIsLoading(true);
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
        
        const newCount = followerCount - 1;
        setFollowerCount(newCount);
        onFollowersCountChange(newCount);
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        const { error } = await supabase
          .from("followers")
          .insert([{ follower_id: user.id, followed_id: userId }]);

        if (error) {
          // Handle unique constraint violation
          if (error.code === '23505') {
            toast.error("You are already following this user");
            setIsFollowing(true);
            return;
          }
          throw error;
        }
        
        const newCount = followerCount + 1;
        setFollowerCount(newCount);
        onFollowersCountChange(newCount);
        setIsFollowing(true);
        toast.success("Followed successfully");
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if it's the current user
  if (isUserSelf || userId === currentUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      variant={isFollowing ? "outline" : "default"}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
