import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function AudioLibrary() {
  const { data: audioPoems, isLoading } = useQuery({
    queryKey: ["audioPoems"],
    queryFn: async () => {
      console.log("Fetching audio poems...");
      const { data, error } = await supabase
        .from("audio_poems")
        .select(`
          *,
          user:profiles!audio_poems_user_id_fkey(username)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching audio poems:", error);
        throw error;
      }
      console.log("Fetched audio poems:", data);
      return data;
    },
  });

  const legendaryPoems = audioPoems?.filter(poem => poem.is_admin_content) || [];
  const userPoems = audioPoems?.filter(poem => !poem.is_admin_content) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audio Poetry Library</h1>
        <Link to="/audio-library/create">
          <Button>Upload Audio Poem</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search poems by title, author, or genre..."
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="legendary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="legendary" className="flex-1">Legendary Poems</TabsTrigger>
          <TabsTrigger value="user" className="flex-1">User Poems</TabsTrigger>
        </TabsList>
        
        <TabsContent value="legendary">
          <div className="grid gap-4">
            {legendaryPoems.map((poem) => (
              <div key={poem.id} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{poem.title}</h2>
                    <p className="text-sm text-muted-foreground">By {poem.user?.username}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {poem.impression_count} listens
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{poem.description}</p>
                <audio controls className="w-full mt-4">
                  <source src={poem.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="user">
          <div className="grid gap-4">
            {userPoems.map((poem) => (
              <div key={poem.id} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{poem.title}</h2>
                    <p className="text-sm text-muted-foreground">By {poem.user?.username}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">
                      {poem.impression_count} listens
                    </div>
                    {poem.content_type === 'paid' && (
                      <Button variant="secondary" size="sm">
                        Rent for ${poem.rental_price}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{poem.description}</p>
                <audio 
                  controls 
                  className="w-full mt-4"
                  onPlay={() => {
                    // Only play first 30 seconds for preview if it's a paid poem
                    if (poem.content_type === 'paid') {
                      setTimeout(() => {
                        const audio = document.querySelector(`audio[data-id="${poem.id}"]`);
                        if (audio) {
                          (audio as HTMLAudioElement).pause();
                          (audio as HTMLAudioElement).currentTime = 0;
                        }
                      }, 30000);
                    }
                  }}
                  data-id={poem.id}
                >
                  <source src={poem.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}