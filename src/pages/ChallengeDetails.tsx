import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function ChallengeDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: responses } = useQuery({
    queryKey: ["challenge-responses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_responses")
        .select("*")
        .eq("challenge_id", id)
        .order("points", { ascending: false });
      
      if (error) throw error;
      return data;
    
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
          {responses?.map((response) => (
            <div key={response.id} className="p-4 border rounded-lg">
              <p>{response.content}</p>
              <p className="mt-2 text-sm text-gray-500">
                Points: {response.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}