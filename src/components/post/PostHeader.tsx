import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

interface PostHeaderProps {
  username: string;
  timestamp: string;
}

export const PostHeader = ({ username, timestamp }: PostHeaderProps) => {
  return (
    <div className="flex items-center p-4">
      <Link to={`/profile/${username}`} className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-gray-100">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
          <AvatarFallback>
            <UserRound className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm hover:underline">{username}</h3>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
      </Link>
    </div>
  );
};