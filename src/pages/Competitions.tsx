
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";

export default function Competitions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: competitions, isLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("start_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredCompetitions = competitions?.filter(competition =>
    competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Poetry Competitions</h1>
        <Link to="/competitions/create">
          <Button>Create Competition</Button>
        </Link>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search competitions..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredCompetitions?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No competitions found matching your search.</p>
        ) : (
          filteredCompetitions?.map((competition) => (
            <Link key={competition.id} to={`/competitions/${competition.id}`}>
              <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                <h2 className="text-xl font-semibold">{competition.title}</h2>
                <p className="text-gray-600">{competition.description}</p>
                <div className="mt-2 text-sm">
                  <p>Category: {competition.category}</p>
                  <p>Start: {new Date(competition.start_date).toLocaleDateString()}</p>
                  <p>End: {new Date(competition.end_date).toLocaleDateString()}</p>
                  {competition.prize_description && (
                    <p>Prize: {competition.prize_description}</p>
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
