import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AudioLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const user = supabase.auth.getUser();

  const { data: audioPoems, isLoading } = useQuery({
    queryKey: ["audioPoems", searchTerm],
    queryFn: async () => {
      console.log("Fetching audio poems...");
      let query = supabase
        .from("audio_poems")
        .select(`
          *,
          user:profiles!audio_poems_user_id_fkey(username)
        `);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching audio poems:", error);
        toast({
          title: "Error",
          description: "Failed to fetch audio poems",
          variant: "destructive",
        });
        throw error;
      }
      console.log("Fetched audio poems:", data);
      return data;
    },
  });

  const currentUserId = supabase.auth.getUser()?.data?.user?.id;
  const explorePoems = audioPoems?.filter(poem => poem.user_id !== currentUserId) || [];
  const myPoems = audioPoems?.filter(poem => poem.user_id === currentUserId) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

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
          placeholder="Search poems by title or description..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="explore" className="flex-1">Explore</TabsTrigger>
          <TabsTrigger value="my-audio" className="flex-1">My Audio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explore">
          <div className="grid gap-4">
            {explorePoems.map((poem) => (
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
            {explorePoems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No audio poems found in explore section
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-audio">
          <div className="grid gap-4">
            {myPoems.map((poem) => (
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
            {myPoems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                You haven't uploaded any audio poems yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}