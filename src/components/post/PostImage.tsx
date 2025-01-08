interface PostImageProps {
  imageUrl: string;
}

export const PostImage = ({ imageUrl }: PostImageProps) => {
  return (
    <div className="relative w-full h-[450px]">
      <img 
        src={imageUrl} 
        alt="Post content" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};