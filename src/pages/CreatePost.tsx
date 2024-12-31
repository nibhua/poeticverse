import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content_type: "text",
          content_text: content,
        });

      if (error) throw error;

      toast.success("Post created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Create Post</h1>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px]"
        />
        
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => toast.info("Image upload coming soon!")}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CreatePost;