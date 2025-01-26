import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function CompetitionDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: competition, isLoading } = useQuery({
    queryKey: ["competition", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["competition-entries", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competition_entries")
        .select("*")
        .eq("competition_id", id)
        .order("votes_count", { ascending: false });
      
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

      const { error } = await supabase.from("competition_entries").insert({
        competition_id: id,
        user_id: user.id,
        content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry submitted successfully",
      });
      setContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!competition) {
    return <div>Competition not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{competition.title}</h1>
      <div className="space-y-4">
        <p>{competition.description}</p>
        <div className="space-y-2">
          <p>Category: {competition.category}</p>
          <p>Start: {new Date(competition.start_date).toLocaleString()}</p>
          <p>End: {new Date(competition.end_date).toLocaleString()}</p>
          {competition.prize_description && (
            <p>Prize: {competition.prize_description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write your entry here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Entry"}
          </Button>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Entries</h2>
          {entries?.map((entry) => (
            <div key={entry.id} className="p-4 border rounded-lg">
              <p>{entry.content}</p>
              <p className="mt-2 text-sm text-gray-500">
                Votes: {entry.votes_count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}