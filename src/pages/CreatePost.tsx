import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/utils/imageUpload";

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postType, setPostType] = useState<"text" | "image">("text");
  const [isTemporary, setIsTemporary] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPostType("image");
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPostType("text");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postType === "text" && !content.trim()) return;
    if (postType === "image" && !selectedImage) {
      toast.error("Please select an image to post");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, "user-images", `posts/${user.id}`);
        if (!imageUrl) throw new Error("Failed to upload image");
      }

      const table = isTemporary ? "temporary_posts" : "posts";
      const postData = {
        user_id: user.id,
        content_type: postType,
        content_text: postType === "text" ? content : null,
        image_url: imageUrl,
        caption: postType === "image" ? content : null,
      };

      if (isTemporary) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        Object.assign(postData, { expires_at: expiresAt.toISOString() });
      }

      console.log("Creating post with data:", postData);
      const { error } = await supabase.from(table).insert(postData);

      if (error) throw error;

      toast.success(`${isTemporary ? "Temporary post" : "Post"} created successfully!`);
      navigate("/");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-xl font-bold">Create Post</h1>
          <Button onClick={handleSubmit} disabled={!content.trim() || loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow px-4">
        <div className="max-w-md mx-auto mt-4 space-y-4">
          {/* Post Type & 24h Toggle row */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={postType === "text" ? "default" : "outline"}
                onClick={() => setPostType("text")}
              >
                Text Post
              </Button>
              <Button
                variant={postType === "image" ? "default" : "outline"}
                onClick={() => setPostType("image")}
              >
                Image Post
              </Button>
              <Button
                variant={isTemporary ? "default" : "outline"}
                onClick={() => setIsTemporary(!isTemporary)}
                className="flex items-center justify-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                24h
              </Button>
            </div>
          </div>

          {/* Card for text / image input */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            {postType === "image" && (
              <div>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Click to upload an image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeSelectedImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Textarea
              placeholder={
                postType === "text" ? "What's on your mind?" : "Add a caption..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={
                postType === "text" ? "min-h-[200px]" : "min-h-[100px]"
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default CreatePost;
