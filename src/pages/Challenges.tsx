import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Challenges() {
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

      <div className="grid gap-4">
        {challenges?.map((challenge) => (
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
        ))}
      </div>
    </div>
  );
}