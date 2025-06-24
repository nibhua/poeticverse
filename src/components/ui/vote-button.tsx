
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VoteButtonProps {
  entryId: string;
  type: "challenge" | "competition";
  initialVotesCount: number;
  hasVoted?: boolean;
  disabled?: boolean;
}

export function VoteButton({
  entryId,
  type,
  initialVotesCount = 0,
  hasVoted = false,
  disabled = false,
}: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [userHasVoted, setUserHasVoted] = useState(hasVoted);
  const { toast } = useToast();

  // Check if user has voted when component mounts
  useEffect(() => {
    checkUserVote();
  }, [entryId, type]);

  // Update local count when initial count changes
  useEffect(() => {
    setVotesCount(initialVotesCount);
  }, [initialVotesCount]);

  // Set up real-time subscription for vote updates
  useEffect(() => {
    const voteTable = type === "challenge" ? "challenge_votes" : "competition_votes";
    const entryTable = type === "challenge" ? "challenge_responses" : "competition_entries";
    const countField = type === "challenge" ? "points" : "votes_count";
    
    // Subscribe to vote changes for real-time updates
    const voteChannel = supabase
      .channel(`votes-${type}-${entryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: voteTable,
          filter: type === "challenge" ? `challenge_response_id=eq.${entryId}` : `competition_entry_id=eq.${entryId}`
        },
        () => {
          // Refresh vote count and user vote status when votes change
          refreshVoteCount();
          checkUserVote();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: entryTable,
          filter: `id=eq.${entryId}`
        },
        (payload) => {
          // Update vote count when the entry count is updated by triggers
          if (payload.new && payload.new[countField] !== undefined) {
            setVotesCount(payload.new[countField]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(voteChannel);
    };
  }, [entryId, type]);

  const checkUserVote = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const table = type === "challenge" ? "challenge_votes" : "competition_votes";
      const idField = type === "challenge" ? "challenge_response_id" : "competition_entry_id";

      const { data: existingVote } = await supabase
        .from(table as any)
        .select('id')
        .eq(idField, entryId)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserHasVoted(!!existingVote);
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  const refreshVoteCount = async () => {
    try {
      const countTable = type === "challenge" ? "challenge_responses" : "competition_entries";
      const countField = type === "challenge" ? "points" : "votes_count";
      
      const { data } = await supabase
        .from(countTable)
        .select(countField)
        .eq('id', entryId)
        .single();
      
      if (data) {
        setVotesCount(data[countField] || 0);
      }
    } catch (error) {
      console.error("Error refreshing vote count:", error);
    }
  };

  const handleVote = async () => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to vote.",
          variant: "destructive",
        });
        return;
      }

      const table = type === "challenge" ? "challenge_votes" : "competition_votes";
      const idField = type === "challenge" ? "challenge_response_id" : "competition_entry_id";

      if (userHasVoted) {
        // Remove vote
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq(idField, entryId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Vote removed",
          description: "Your vote has been removed.",
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from(table as any)
          .insert({
            [idField]: entryId,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Vote submitted",
          description: "Your vote has been recorded.",
        });
      }

      // The real-time subscription will handle updating the UI
      // but we can immediately update the local state for responsiveness
      setUserHasVoted(!userHasVoted);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your vote. Please try again.",
        variant: "destructive",
      });
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={isVoting || disabled}
      className={`flex items-center gap-2 ${
        userHasVoted 
          ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
          : 'hover:bg-gray-50'
      }`}
    >
      <ThumbsUp className={`h-4 w-4 ${userHasVoted ? 'fill-blue-600' : ''}`} />
      <span>{votesCount}</span>
      {isVoting && <span className="text-xs">...</span>}
    </Button>
  );
}
