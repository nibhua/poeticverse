
interface PostImageProps {
  imageUrl: string;
}

export const PostImage = ({ imageUrl }: PostImageProps) => {
  return (
    <div className="relative w-full">
      <img 
        src={imageUrl} 
        alt="Post content" 
        className="w-full h-auto object-contain max-h-[500px]"
      />
    </div>
  );
};
