import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Challenges() {
  const { toast } = useToast();
  
  const { data: challenges, isLoading, error } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      console.log("Fetching challenges...");
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching challenges:", error);
        throw error;
      }
      
      console.log("Challenges fetched successfully:", data);
      return data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (error) {
    console.error("Error in challenges component:", error);
    toast({
      title: "Error",
      description: "Failed to load challenges. Please try again.",
      variant: "destructive",
    });
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Poetry Challenges</h1>
          <Link to="/challenges/create">
            <Button>Create Challenge</Button>
          </Link>
        </div>
        <div className="text-red-500">Failed to load challenges. Please refresh the page.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Poetry Challenges</h1>
          <Link to="/challenges/create">
            <Button>Create Challenge</Button>
          </Link>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <div className="mt-2">
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
        {challenges?.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No challenges found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
}