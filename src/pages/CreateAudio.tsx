import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function CreateAudio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setIsLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("audio-poems")
        .upload(audioPath, audioFile);

      if (uploadError) throw uploadError;

      const { data: audioUrl } = supabase.storage
        .from("audio-poems")
        .getPublicUrl(audioPath);

      const { error: dbError } = await supabase.from("audio_poems").insert({
        user_id: user.id,
        title,
        description,
        audio_url: audioUrl.publicUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Audio poem uploaded successfully",
      });
      navigate("/audio-library");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload audio poem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Audio Poem</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}