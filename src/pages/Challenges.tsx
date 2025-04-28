
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";

export default function Challenges() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredChallenges = challenges?.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Poetry Challenges</h1>
        <Link to="/challenges/create">
          <Button>Create Challenge</Button>
        </Link>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search challenges..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredChallenges?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No challenges found matching your search.</p>
        ) : (
          filteredChallenges?.map((challenge) => (
            <Link key={challenge.id} to={`/challenges/${challenge.id}`}>
              <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                <h2 className="text-xl font-semibold">{challenge.title}</h2>
                <p className="text-gray-600">{challenge.description}</p>
                <div className="mt-2 text-sm">
                  <p>Theme: {challenge.theme}</p>
                  <p>Style: {challenge.style}</p>
                  {challenge.deadline && (
                    <p>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
