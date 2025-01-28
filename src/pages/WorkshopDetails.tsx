import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function WorkshopDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Fetch workshop details
  const { data: workshop, isLoading: isLoadingWorkshop } = useQuery({
    queryKey: ["workshop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*, host:profiles!workshops_host_id_fkey(*)")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch registration status
  const { data: registration } = useQuery({
    queryKey: ["registration", id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*")
        .eq("workshop_id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Fetch all registrations (for workshop host)
  const { data: registrations } = useQuery({
    queryKey: ["registrations", id],
    queryFn: async () => {
      if (!user || user.id !== workshop?.host_id) return null;
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*, user:profiles!workshop_registrations_user_id_fkey(*)")
        .eq("workshop_id", id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!workshop && !!user && user.id === workshop.host_id,
  });

  // Register for workshop mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user || !paymentScreenshot) throw new Error("Missing required data");

      // Upload payment screenshot
      const fileExt = paymentScreenshot.name.split('.').pop();
      const filePath = `${id}/${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("workshop-payments")
        .upload(filePath, paymentScreenshot);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("workshop-payments")
        .getPublicUrl(filePath);

      // Create registration
      const { error } = await supabase
        .from("workshop_registrations")
        .insert({
          workshop_id: id,
          user_id: user.id,
          payment_screenshot_url: publicUrl,
          status: "pending"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      toast({
        title: "Success",
        description: "Registration submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register for workshop",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    },
  });

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ status: "approved" })
        .eq("id", registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      toast({
        title: "Success",
        description: "Registration approved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      });
      console.error("Update status error:", error);
    },
  });

  // Update meeting link mutation
  const updateMeetingLinkMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("workshops")
        .update({ meeting_link: meetingLink })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop", id] });
      setIsUpdateDialogOpen(false);
      toast({
        title: "Success",
        description: "Meeting link updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update meeting link",
        variant: "destructive",
      });
      console.error("Update meeting link error:", error);
    },
  });

  if (isLoadingWorkshop) {
    return <div>Loading...</div>;
  }

  if (!workshop) {
    return <div>Workshop not found</div>;
  }

  const isHost = user?.id === workshop.host_id;
  const isRegistered = !!registration;
  const isApproved = registration?.status === "approved";

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
          {isHost && (
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Update Meeting Link</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Meeting Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter meeting link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                  <Button onClick={() => updateMeetingLinkMutation.mutate()}>
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {isApproved && workshop.meeting_link && (
            <div>
              <p>Meeting Link:</p>
              <a
                href={workshop.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {workshop.meeting_link}
              </a>
            </div>
          )}
        </div>

        {!isHost && !isRegistered && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Payment QR Code:</p>
              {workshop.payment_qr_code_url && (
                <img
                  src={workshop.payment_qr_code_url}
                  alt="Payment QR Code"
                  className="max-w-xs"
                />
              )}
            </div>
            <div>
              <p className="font-semibold">Upload Payment Screenshot:</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
              />
            </div>
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={!paymentScreenshot}
            >
              Register for Workshop
            </Button>
          </div>
        )}

        {isHost && registrations && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Registration Requests</h2>
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="border p-4 rounded-lg space-y-2"
                >
                  <p>User: {reg.user.username}</p>
                  <p>Status: {reg.status}</p>
                  {reg.payment_screenshot_url && (
                    <div>
                      <p>Payment Screenshot:</p>
                      <img
                        src={reg.payment_screenshot_url}
                        alt="Payment Screenshot"
                        className="max-w-xs"
                      />
                    </div>
                  )}
                  {reg.status === "pending" && (
                    <Button onClick={() => updateStatusMutation.mutate(reg.id)}>
                      Approve Registration
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}