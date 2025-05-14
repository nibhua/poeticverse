
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";

export default function CreateChallenge() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("challenges").insert({
        creator_id: user.id,
        title,
        description,
        theme,
        style,
        deadline,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Challenge created successfully",
      });
      navigate("/challenges");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient-subtle">Create Challenge</h1>
        <p className="text-gray-600 mt-2">Challenge the community with your poetry prompt</p>
      </div>
      
      <motion.div 
        className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Challenge Title</label>
            <Input
              placeholder="Give your challenge a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the challenge and what you're looking for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[120px] transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Input
                placeholder="What should the poetry be about?"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                required
                className="transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Input
                placeholder="E.g., Haiku, Sonnet, Free verse..."
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                required
                className="transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="pl-10 transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p className="text-xs text-gray-500">
              Challenge will automatically mark as completed after this deadline
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-6 btn-gradient"
          >
            {isLoading ? (
              <>Creating Challenge...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Challenge
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
