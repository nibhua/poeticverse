import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";
import { Loader2 } from "lucide-react";

export default function WorkshopDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  // Fetch workshop details with better error handling
  const { data: workshop, isLoading: isLoadingWorkshop, error: workshopError } = useQuery({
    queryKey: ["workshop", id],
    queryFn: async () => {
      console.log("Fetching workshop details...");
      const { data, error } = await supabase
        .from("workshops")
        .select("*, host:profiles!workshops_host_id_fkey(*)")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching workshop:", error);
        throw error;
      }
      console.log("Workshop details fetched:", data);
      return data;
    },
    retry: 1,
  });

  // Fetch current user with better error handling
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
      console.log("Current user fetched:", user);
      return user;
    },
    retry: 1,
  });

  // Fetch registration status with better error handling
  const { data: registration, isLoading: isLoadingRegistration } = useQuery({
    queryKey: ["registration", id],
    queryFn: async () => {
      if (!user) return null;
      console.log("Fetching registration status...");
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*")
        .eq("workshop_id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching registration:", error);
        throw error;
      }
      console.log("Registration status fetched:", data);
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  // Fetch all registrations with better error handling
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["registrations", id],
    queryFn: async () => {
      if (!user || user.id !== workshop?.host_id) return null;
      console.log("Fetching all registrations...");
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*, user:profiles!workshop_registrations_user_id_fkey(*)")
        .eq("workshop_id", id);
      
      if (error) {
        console.error("Error fetching registrations:", error);
        throw error;
      }
      console.log("All registrations fetched:", data);
      return data;
    },
    enabled: !!workshop && !!user && user.id === workshop.host_id,
    retry: 1,
  });

  // Register for workshop mutation with better error handling
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user || !paymentScreenshot) {
        throw new Error("Missing required data");
      }

      console.log("Starting registration process...");
      const screenshotUrl = await uploadImage(
        paymentScreenshot,
        "workshop-payments",
        `screenshots/${Date.now()}`
      );

      if (!screenshotUrl) {
        throw new Error("Failed to upload payment screenshot");
      }

      console.log("Payment screenshot uploaded:", screenshotUrl);

      const { error } = await supabase
        .from("workshop_registrations")
        .insert({
          workshop_id: id,
          user_id: user.id,
          payment_screenshot_url: screenshotUrl,
          status: "pending",
          payment_status: workshop?.is_paid ? "pending" : "not_required"
        });
      
      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      console.log("Registration completed successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      toast({
        title: "Success",
        description: "Registration submitted successfully",
      });
      setPaymentScreenshot(null);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for workshop",
        variant: "destructive",
      });
    },
  });

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

  if (workshopError) {
    return <div className="text-center text-red-500">Error loading workshop details</div>;
  }

  if (isLoadingWorkshop || isLoadingUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workshop) {
    return <div className="text-center">Workshop not found</div>;
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
