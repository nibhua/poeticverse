
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ProfileSettings } from "./ProfileSettings";
import { FollowButton } from "./FollowButton";
import { FollowList } from "./FollowList";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 glass-card perspective-1000 transform-preserve-3d bg-gradient-to-br from-white/90 to-white/70 border-0"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 ring-4 ring-offset-2 ring-primary/20 shadow-lg">
            <AvatarImage src={profilePicUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-primary">
              <UserRound className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 flex-wrap">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-700 break-all"
            >
              {username}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {isCurrentUser ? (
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/profile/${username}/edit`)}
                    className="hover:bg-gray-100 rounded-full px-3 sm:px-4 shadow-sm border border-gray-200 text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Edit Profile
                  </Button>
                  <ProfileSettings userId={userId} />
                </div>
              ) : (
                <FollowButton 
                  userId={userId} 
                  initialFollowersCount={followersCount}
                  onFollowersCountChange={setCurrentFollowersCount}
                  isCurrentUser={isCurrentUser}
                />
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex gap-2 sm:gap-4 md:gap-8 mb-4 text-sm overflow-x-auto pb-2"
          >
            <div className="flex flex-col items-center px-2 sm:px-4 py-2 bg-white/50 rounded-xl shadow-sm min-w-0 flex-shrink-0">
              <span className="font-semibold text-sm sm:text-lg text-gray-900 truncate">{postsCount}</span>
              <span className="text-gray-500 text-xs sm:text-sm truncate">posts</span>
            </div>
            <button 
              className="flex flex-col items-center px-2 sm:px-4 py-2 bg-white/50 rounded-xl shadow-sm hover:bg-white/80 transition-colors min-w-0 flex-shrink-0"
              onClick={() => setShowFollowers(true)}
            >
              <span className="font-semibold text-sm sm:text-lg text-gray-900 truncate">{currentFollowersCount}</span>
              <span className="text-gray-500 text-xs sm:text-sm truncate">followers</span>
            </button>
            <button 
              className="flex flex-col items-center px-2 sm:px-4 py-2 bg-white/50 rounded-xl shadow-sm hover:bg-white/80 transition-colors min-w-0 flex-shrink-0"
              onClick={() => setShowFollowing(true)}
            >
              <span className="font-semibold text-sm sm:text-lg text-gray-900 truncate">{followingCount}</span>
              <span className="text-gray-500 text-xs sm:text-sm truncate">following</span>
            </button>
          </motion.div>

          {(fullName || bio) && (
            <motion.div 
              className="p-3 sm:p-4 bg-white/70 rounded-lg shadow-sm backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {fullName && <div className="font-semibold mb-2 text-gray-800 text-sm sm:text-base break-words">{fullName}</div>}
              {bio && <div className="whitespace-pre-wrap text-gray-600 leading-relaxed text-sm sm:text-base break-words">{bio}</div>}
            </motion.div>
          )}
        </div>
      </div>

      <FollowList
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        userId={userId}
        type="followers"
        isCurrentUser={isCurrentUser}
      />

      <FollowList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        userId={userId}
        type="following"
        isCurrentUser={isCurrentUser}
      />
    </motion.div>
  );
};
