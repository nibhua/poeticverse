import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { FollowButton } from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FollowListProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userId: string;
  type: "followers" | "following";
}

export const FollowList = ({ isOpen, onClose, title, userId, type }: FollowListProps) => {
  const [users, setUsers] = useState<Array<{
    id: string;
    username: string;
    profile_pic_url: string | null;
  }>>([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      if (type === "followers") {
        const { data, error } = await supabase
          .from('followers')
          .select(`
            follower_profile:profiles!followers_follower_id_fkey (
              id,
              username,
              profile_pic_url
            )
          `)
          .eq('followed_id', userId);

        if (error) throw error;
        setUsers(data?.map(item => item.follower_profile) || []);
      } else {
        const { data, error } = await supabase
          .from('followers')
          .select(`
            followed_profile:profiles!followers_followed_id_fkey (
              id,
              username,
              profile_pic_url
            )
          `)
          .eq('follower_id', userId);

        if (error) throw error;
        setUsers(data?.map(item => item.followed_profile) || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Failed to load ${type}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => {
                  onClose();
                  navigate(`/profile/${user.username}`);
                }}
              >
                <Avatar>
                  <AvatarImage src={user.profile_pic_url || undefined} />
                  <AvatarFallback>
                    <UserRound className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.username}</span>
              </div>
              <FollowButton 
                userId={user.id}
                initialFollowersCount={0}
                onFollowersCountChange={() => {}}
              />
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No {type} yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};