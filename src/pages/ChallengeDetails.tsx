import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengeDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: challenge, isLoading: challengeLoading, error: challengeError } = useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      console.log("Fetching challenge details...");
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching challenge:", error);
        throw error;
      }
      
      console.log("Challenge details fetched:", data);
      return data;
    },
  });

  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ["challenge-responses", id],
    queryFn: async () => {
      console.log("Fetching challenge responses...");
      const { data, error } = await supabase
        .from("challenge_responses")
        .select("*")
        .eq("challenge_id", id)
        .order("points", { ascending: false });
      
      if (error) {
        console.error("Error fetching responses:", error);
        throw error;
      }
      
      console.log("Challenge responses fetched:", data);
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting challenge response...");

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("challenge_responses").insert({
        challenge_id: id,
        user_id: user.id,
        content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response submitted successfully",
      });
      setContent("");
      console.log("Challenge response submitted successfully");
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeError) {
    console.error("Error in challenge details:", challengeError);
    return <div className="text-red-500">Failed to load challenge. Please try again.</div>;
  }

  if (challengeLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{challenge.title}</h1>
      <div className="space-y-4">
        <p>{challenge.description}</p>
        <div className="space-y-2">
          <p>Theme: {challenge.theme}</p>
          <p>Style: {challenge.style}</p>
          {challenge.deadline && (
            <p>Deadline: {new Date(challenge.deadline).toLocaleString()}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write your response here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Responses</h2>
          {responsesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : responses?.length === 0 ? (
            <p className="text-gray-500">No responses yet. Be the first to respond!</p>
          ) : (
            responses?.map((response) => (
              <div key={response.id} className="p-4 border rounded-lg">
                <p>{response.content}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Points: {response.points}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}