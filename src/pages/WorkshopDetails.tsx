import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";

export default function WorkshopDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

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

      const screenshotUrl = await uploadImage(
        paymentScreenshot,
        "workshop-payments",
        `screenshots/${Date.now()}`
      );

      if (!screenshotUrl) throw new Error("Failed to upload payment screenshot");

      const { error } = await supabase
        .from("workshop_registrations")
        .insert({
          workshop_id: id,
          user_id: user.id,
          payment_screenshot_url: screenshotUrl,
          status: "pending",
          payment_status: workshop?.is_paid ? "pending" : "not_required"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      toast({
        title: "Success",
        description: "Registration submitted successfully",
      });
      setPaymentScreenshot(null);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register for workshop",
        variant: "destructive",
      });
    },
  });

  // Approve registration mutation
  const approveRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ 
          status: "approved",
          payment_status: "approved"
        })
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
      console.error("Approval error:", error);
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      });
    },
  });

  // Reject registration mutation
  const rejectRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ 
          status: "rejected",
          payment_status: "rejected"
        })
        .eq("id", registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      toast({
        title: "Success",
        description: "Registration rejected successfully",
      });
    },
    onError: (error) => {
      console.error("Rejection error:", error);
      toast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      });
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
          
          {/* Meeting Link - Only visible to approved participants and host */}
          {(isApproved || isHost) && workshop.meeting_link && (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-semibold">Meeting Link:</p>
              <a
                href={workshop.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {workshop.meeting_link}
              </a>
            </div>
          )}
        </div>

        {/* Registration Section */}
        {!isHost && !isRegistered && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">Register for Workshop</h2>
            {workshop.is_paid && workshop.payment_qr_code_url && (
              <div className="space-y-2">
                <p className="font-medium">Payment QR Code:</p>
                <img
                  src={workshop.payment_qr_code_url}
                  alt="Payment QR Code"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
            {workshop.is_paid && (
              <div className="space-y-2">
                <p className="font-medium">Upload Payment Screenshot:</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={workshop.is_paid && !paymentScreenshot}
            >
              Register for Workshop
            </Button>
          </div>
        )}

        {/* Registration Status */}
        {isRegistered && !isHost && (
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Registration Status</h2>
            <p>Status: <span className="capitalize">{registration.status}</span></p>
            {registration.payment_screenshot_url && (
              <div className="mt-2">
                <p className="font-medium">Your Payment Screenshot:</p>
                <img
                  src={registration.payment_screenshot_url}
                  alt="Payment Screenshot"
                  className="max-w-xs mt-2 rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Host View - Registration Management */}
        {isHost && registrations && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Registration Requests</h2>
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="border p-4 rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{reg.user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{reg.status}</span>
                      </p>
                    </div>
                    {reg.status === "pending" && (
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveRegistrationMutation.mutate(reg.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectRegistrationMutation.mutate(reg.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {reg.payment_screenshot_url && (
                    <div>
                      <p className="font-medium">Payment Screenshot:</p>
                      <img
                        src={reg.payment_screenshot_url}
                        alt="Payment Screenshot"
                        className="max-w-xs mt-2 rounded-lg"
                      />
                    </div>
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