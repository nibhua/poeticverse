
import { useState } from "react";
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

      // Check if user already voted - using explicit type casting to avoid TypeScript errors
      const { data: existingVote, error: checkError } = await supabase
        .from(table as any)
        .select('*')
        .eq(idField, entryId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingVote) {
        toast({
          title: "Already voted",
          description: "You have already voted for this entry.",
        });
        setUserHasVoted(true);
        return;
      }

      // Insert vote - using explicit type casting to avoid TypeScript errors
      const { error: voteError } = await supabase
        .from(table as any)
        .insert({
          [idField]: entryId,
          user_id: user.id,
        });

      if (voteError) throw voteError;

      // Update vote count
      const { error: updateError } = await supabase
        .from(countTable)
        .update({ votes_count: votesCount + 1 })
        .eq('id', entryId);

      if (updateError) throw updateError;

      setVotesCount(prevCount => prevCount + 1);
      setUserHasVoted(true);
      
      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
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
      disabled={isVoting || userHasVoted || disabled}
      className={`flex items-center gap-1 ${userHasVoted ? 'bg-primary/10 text-primary' : ''}`}
    >
      <ThumbsUp className={`h-4 w-4 ${userHasVoted ? 'fill-primary' : ''}`} />
      <span className="ml-1">{votesCount}</span>
    </Button>
  );
}
