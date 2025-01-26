import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function WorkshopDetails() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: workshop, isLoading } = useQuery({
    queryKey: ["workshop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleRegister = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("workshop_registrations").insert({
        workshop_id: id,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered for workshop",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for workshop",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workshop) {
    return <div>Workshop not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{workshop.title}</h1>
      <div className="space-y-4">
        <p>{workshop.description}</p>
        <div className="space-y-2">
          <p>Date: {new Date(workshop.scheduled_at).toLocaleString()}</p>
          <p>Duration: {workshop.duration} minutes</p>
          {workshop.is_paid && <p>Price: ${workshop.price}</p>}
          <p>Maximum Participants: {workshop.max_participants}</p>
        </div>
        <Button onClick={handleRegister}>Register for Workshop</Button>
      </div>
    </div>
  );
}