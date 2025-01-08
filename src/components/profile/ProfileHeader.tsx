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
    <div className="p-4 max-w-[935px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
        <Avatar className="w-[150px] h-[150px]">
          <AvatarImage src={profilePicUrl || undefined} />
          <AvatarFallback>
            <UserRound className="w-16 h-16" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-semibold">{username}</h1>
            {isCurrentUser ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/profile/${username}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
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

          <div className="flex gap-8 mb-4 text-sm">
            <div>
              <span className="font-semibold">{postsCount}</span>
              <span className="text-gray-500 ml-1">posts</span>
            </div>
            <button 
              className="hover:opacity-75 transition-opacity"
              onClick={() => setShowFollowers(true)}
            >
              <span className="font-semibold">{currentFollowersCount}</span>
              <span className="text-gray-500 ml-1">followers</span>
            </button>
            <button 
              className="hover:opacity-75 transition-opacity"
              onClick={() => setShowFollowing(true)}
            >
              <span className="font-semibold">{followingCount}</span>
              <span className="text-gray-500 ml-1">following</span>
            </button>
          </div>

          {(fullName || bio) && (
            <div className="text-sm">
              {fullName && <div className="font-semibold mb-1">{fullName}</div>}
              {bio && <div className="whitespace-pre-wrap">{bio}</div>}
            </div>
          )}
        </div>
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