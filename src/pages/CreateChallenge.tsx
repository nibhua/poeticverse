import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Challenge</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          placeholder="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          required
        />
        <Input
          placeholder="Style (e.g., Haiku, Sonnet)"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          required
        />
        <Input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Challenge"}
        </Button>
      </form>
    </div>
  );
}