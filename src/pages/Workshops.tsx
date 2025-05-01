
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";

export default function Workshops() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: workshops, isLoading } = useQuery({
    queryKey: ["workshops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .order("scheduled_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredWorkshops = workshops?.filter(workshop =>
    workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Poetry Workshops</h1>
        <Link to="/workshops/create">
          <Button>Create Workshop</Button>
        </Link>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search workshops..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredWorkshops?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No workshops found matching your search.</p>
        ) : (
          filteredWorkshops?.map((workshop) => (
            <Link key={workshop.id} to={`/workshops/${workshop.id}`}>
              <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                <h2 className="text-xl font-semibold">{workshop.title}</h2>
                <p className="text-gray-600">{workshop.description}</p>
                <div className="mt-2 text-sm">
                  <p>Date: {new Date(workshop.scheduled_at).toLocaleDateString()}</p>
                  <p>Duration: {workshop.duration} minutes</p>
                  {workshop.is_paid && <p>Price: ${workshop.price}</p>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
