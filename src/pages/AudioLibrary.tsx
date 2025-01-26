import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function AudioLibrary() {
  const { data: audioPoems, isLoading } = useQuery({
    queryKey: ["audioPoems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_poems")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audio Poetry Library</h1>
        <Link to="/audio-library/create">
          <Button>Upload Audio Poem</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {audioPoems?.map((poem) => (
          <div key={poem.id} className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">{poem.title}</h2>
            <p className="text-gray-600">{poem.description}</p>
            <audio controls className="w-full mt-2">
              <source src={poem.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-2 text-sm text-gray-500">
              Impressions: {poem.impression_count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}