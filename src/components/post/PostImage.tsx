interface PostImageProps {
  imageUrl: string;
}

export const PostImage = ({ imageUrl }: PostImageProps) => {
  return (
    <div className="relative w-full aspect-square mb-4">
      <img 
        src={imageUrl} 
        alt="Post content" 
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
      />
    </div>
  );
};