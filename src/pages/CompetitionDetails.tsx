
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { VoteButton } from "@/components/ui/vote-button";

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

  const { data: entries, refetch: refetchEntries } = useQuery({
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

  const { data: userVotes, refetch: refetchUserVotes } = useQuery({
    queryKey: ["user-competition-votes", id],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("competition_votes")
        .select("competition_entry_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data?.map(vote => vote.competition_entry_id) || [];
    },
    enabled: !!id,
  });

  // Set up real-time subscription for competition entries
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`competition-entries-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_entries',
          filter: `competition_id=eq.${id}`
        },
        () => {
          // Refresh entries when any entry is updated
          refetchEntries();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_votes'
        },
        () => {
          // Refresh user votes when votes change
          refetchUserVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchEntries, refetchUserVotes]);

  const isCompetitionEnded = competition ? new Date(competition.end_date) < new Date() : false;
  const votedEntryIds = userVotes || [];

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
      refetchEntries();
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
          {isCompetitionEnded && (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800">
              This competition has ended. No new entries can be submitted.
            </div>
          )}
        </div>

        {!isCompetitionEnded && (
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
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Entries</h2>
          {entries?.length === 0 && (
            <div className="p-4 text-center text-gray-500 border rounded-lg">
              No entries yet. Be the first to submit!
            </div>
          )}
          {entries?.map((entry, index) => (
            <div key={entry.id} className="p-4 border rounded-lg">
              {isCompetitionEnded && index < 3 && (
                <div className={`inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full ${
                  index === 0 ? 'bg-amber-100 text-amber-800' : 
                  index === 1 ? 'bg-gray-200 text-gray-800' : 
                  'bg-orange-100 text-orange-800'
                }`}>
                  {index === 0 ? '1st Place 🏆' : index === 1 ? '2nd Place 🥈' : '3rd Place 🥉'}
                </div>
              )}
              <p>{entry.content}</p>
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <div>
                  {isCompetitionEnded ? (
                    <span>Final Votes: {entry.votes_count}</span>
                  ) : (
                    <VoteButton
                      entryId={entry.id}
                      type="competition"
                      initialVotesCount={entry.votes_count || 0}
                      hasVoted={votedEntryIds.includes(entry.id)}
                    />
                  )}
                </div>
                <span>Submitted: {new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
