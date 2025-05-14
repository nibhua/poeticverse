
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { VoteButton } from "@/components/ui/vote-button";

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const { data: responses, refetch } = useQuery({
    queryKey: ["challenge-responses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_responses")
        .select("*, user:profiles!challenge_responses_user_id_fkey(username, profile_pic_url)")
        .eq("challenge_id", id)
        .order("points", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userVotes } = useQuery({
    queryKey: ["user-challenge-votes", id],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("challenge_votes")
        .select("challenge_response_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(vote => vote.challenge_response_id);
    },
    enabled: !!id,
  });

  const isChallengeEnded = challenge ? (challenge.deadline ? new Date(challenge.deadline) < new Date() : false) : false;
  const votedResponseIds = userVotes || [];

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

      toast.success("Response submitted successfully");
      setContent("");
      refetch();
    } catch (error) {
      toast.error("Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Challenge not found</h2>
          <p className="text-gray-500">The requested challenge does not exist.</p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/challenges")}
          size="sm"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => navigate("/challenges")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {challenge.title}
        </h1>
      </div>

      <div className="space-y-8">
        <Card className="overflow-hidden border-none shadow-lg">
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed">{challenge.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 bg-muted/40 rounded-lg">
                  <h3 className="font-medium mb-2">Challenge Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Theme:</span> {challenge.theme}</p>
                    <p><span className="font-medium">Style:</span> {challenge.style}</p>
                    {challenge.deadline && (
                      <p>
                        <span className="font-medium">Deadline:</span> {new Date(challenge.deadline).toLocaleDateString()} at {new Date(challenge.deadline).toLocaleTimeString()}
                        {isChallengeEnded && <span className="ml-2 text-red-500">(Ended)</span>}
                      </p>
                    )}
                    {challenge.is_paid && challenge.entry_fee && (
                      <p><span className="font-medium">Entry Fee:</span> ${challenge.entry_fee}</p>
                    )}
                  </div>
                </div>
                {(challenge.judging_criteria || challenge.rewards) && (
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <h3 className="font-medium mb-2">Additional Information</h3>
                    <div className="space-y-2">
                      {challenge.judging_criteria && (
                        <p><span className="font-medium">Judging Criteria:</span> {challenge.judging_criteria}</p>
                      )}
                      {challenge.rewards && (
                        <p><span className="font-medium">Rewards:</span> {challenge.rewards}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isChallengeEnded && (
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xl font-semibold mb-4">Submit Your Response</h3>
                  <Textarea
                    placeholder="Write your response here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="min-h-32"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full mt-4"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Response"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Responses</h2>
          {responses?.length ? (
            <div className="grid gap-4">
              {responses.map((response, index) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3">
                        {isChallengeEnded && index < 3 && (
                          <div className={`inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full w-fit ${
                            index === 0 ? 'bg-amber-100 text-amber-800' : 
                            index === 1 ? 'bg-gray-200 text-gray-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index === 0 ? '1st Place 🏆' : index === 1 ? '2nd Place 🥈' : '3rd Place 🥉'}
                          </div>
                        )}
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            {response.user?.profile_pic_url ? (
                              <img 
                                src={response.user.profile_pic_url} 
                                alt={response.user.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary/80">
                                {response.user?.username?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <span className="ml-2 font-medium text-sm">
                            {response.user?.username || "Anonymous"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{response.content}</p>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {isChallengeEnded ? (
                              <span>Final Points: {response.points}</span>
                            ) : (
                              <VoteButton
                                entryId={response.id}
                                type="challenge"
                                initialVotesCount={response.points || 0}
                                hasVoted={votedResponseIds.includes(response.id)}
                              />
                            )}
                          </div>
                          <span>{new Date(response.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-muted/20">
              <p className="text-muted-foreground">No responses yet. Be the first to respond!</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
