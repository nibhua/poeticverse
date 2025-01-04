import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ProfileSettings } from "./ProfileSettings";
import { FollowButton } from "./FollowButton";
import { FollowList } from "./FollowList";

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
  const [currentFollowersCount, setCurrentFollowersCount] = useState(followersCount);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

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
            <ProfileSettings userId={userId} />
          </div>
        ) : (
          <FollowButton 
            userId={userId} 
            initialFollowersCount={followersCount}
            onFollowersCountChange={setCurrentFollowersCount}
          />
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
          <button 
            className="text-center hover:opacity-75 transition-opacity"
            onClick={() => setShowFollowers(true)}
          >
            <div className="font-bold">{currentFollowersCount}</div>
            <div className="text-gray-600 text-sm">Followers</div>
          </button>
          <button 
            className="text-center hover:opacity-75 transition-opacity"
            onClick={() => setShowFollowing(true)}
          >
            <div className="font-bold">{followingCount}</div>
            <div className="text-gray-600 text-sm">Following</div>
          </button>
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

      <FollowList
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        userId={userId}
        type="followers"
      />

      <FollowList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        userId={userId}
        type="following"
      />
    </div>
  );
};