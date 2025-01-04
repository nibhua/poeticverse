interface PostHeaderProps {
  username: string;
  timestamp: string;
}

export const PostHeader = ({ username, timestamp }: PostHeaderProps) => {
  return (
    <div className="flex items-start mb-2">
      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
      <div>
        <h3 className="font-semibold">{username}</h3>
        <p className="text-sm text-gray-500">{timestamp}</p>
      </div>
    </div>
  );
};