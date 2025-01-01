import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  username: string;
  fullName: string | null;
  bio: string | null;
  profilePicUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isCurrentUser: boolean;
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
}: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{username}</h1>
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
            <div className="font-bold">{followersCount}</div>
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