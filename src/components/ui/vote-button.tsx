
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

  const checkUserVote = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const table = type === "challenge" ? "challenge_votes" : "competition_votes";
      const idField = type === "challenge" ? "challenge_response_id" : "competition_entry_id";

      const { data: existingVote, error } = await supabase
        .from(table as any)
        .select('*')
        .eq(idField, entryId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking vote:", error);
        return;
      }

      setUserHasVoted(!!existingVote);
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  const handleVote = async () => {
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
      const countTable = type === "challenge" ? "challenge_responses" : "competition_entries";
      const countField = type === "challenge" ? "points" : "votes_count";

      if (userHasVoted) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq(idField, entryId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Decrease vote count
        const { error: updateError } = await supabase
          .from(countTable)
          .update({ [countField]: Math.max(0, votesCount - 1) })
          .eq('id', entryId);

        if (updateError) throw updateError;

        setVotesCount(prevCount => Math.max(0, prevCount - 1));
        setUserHasVoted(false);
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed.",
        });
      } else {
        // Add vote
        const { error: voteError } = await supabase
          .from(table as any)
          .insert({
            [idField]: entryId,
            user_id: user.id,
          });

        if (voteError) throw voteError;

        // Increase vote count
        const { error: updateError } = await supabase
          .from(countTable)
          .update({ [countField]: votesCount + 1 })
          .eq('id', entryId);

        if (updateError) throw updateError;

        setVotesCount(prevCount => prevCount + 1);
        setUserHasVoted(true);
        
        toast({
          title: "Vote submitted",
          description: "Your vote has been recorded.",
        });
      }
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
      className={`flex items-center gap-1 ${userHasVoted ? 'bg-primary/10 text-primary border-primary' : ''}`}
    >
      <ThumbsUp className={`h-4 w-4 ${userHasVoted ? 'fill-primary' : ''}`} />
      <span className="ml-1">{votesCount}</span>
      {isVoting && <span className="ml-1 text-xs">...</span>}
    </Button>
  );
}
