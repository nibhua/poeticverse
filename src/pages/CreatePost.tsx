
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, X, Clock, SendHorizontal, FileText, Calendar } from "lucide-react";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(
          selectedImage,
          "user-images",
          `posts/${user.id}`
        );
        if (!imageUrl) throw new Error("Failed to upload image");
      }

      const table = isTemporary ? 'temporary_posts' : 'posts';
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
      const { error } = await supabase
        .from(table)
        .insert(postData);

      if (error) throw error;

      toast.success(`${isTemporary ? 'Temporary post' : 'Post'} created successfully!`);
      navigate("/");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      <motion.div 
        variants={itemVariants}
        className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10 rounded-b-lg glass-card shadow-sm"
      >
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-gradient-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create Post
          </motion.h1>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="btn-gradient rounded-full px-5 py-2 h-auto"
          >
            {loading ? 
              "Posting..." : 
              <span className="flex items-center">
                <SendHorizontal className="h-4 w-4 mr-2" />
                Post
              </span>
            }
          </Button>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="p-4 space-y-6"
      >
        <motion.div 
          variants={itemVariants}
          className="flex space-x-2"
        >
          <Button
            variant={postType === "text" ? "default" : "outline"}
            onClick={() => setPostType("text")}
            className="flex-1 rounded-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Text Post
          </Button>
          <Button
            variant={postType === "image" ? "default" : "outline"}
            onClick={() => setPostType("image")}
            className="flex-1 rounded-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image Post
          </Button>
          <Button
            variant={isTemporary ? "default" : "outline"}
            onClick={() => setIsTemporary(!isTemporary)}
            className="rounded-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            24h
          </Button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="card-3d perspective-1000"
        >
          <div className="glass-card p-6 transform-preserve-3d">
            {postType === "image" && (
              <motion.div 
                variants={itemVariants}
                className="space-y-4 mb-4"
              >
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 transition-colors hover:bg-gray-50/80">
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
                      <motion.div 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center mb-3"
                      >
                        <ImageIcon className="h-8 w-8 text-primary/70" />
                      </motion.div>
                      <span className="text-base font-medium text-gray-600">
                        Click to upload an image
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        JPG, PNG or GIF up to 10MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <motion.div 
                    className="relative rounded-xl overflow-hidden"
                    layoutId="image-preview"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={removeSelectedImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Textarea
                placeholder={postType === "text" ? "What's on your mind?" : "Add a caption..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`focus-visible:ring-1 focus-visible:ring-primary border-none bg-transparent resize-none min-h-[${postType === "text" ? "200px" : "100px"}]`}
              />
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-4 flex items-center text-sm text-gray-500"
            >
              {isTemporary ? (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>This post will expire in 24 hours</span>
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePost;
