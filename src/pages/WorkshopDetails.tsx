
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronLeft, X } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkshopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch registration status (for participants)
  const { data: registration } = useQuery({
    queryKey: ["registration", id, user?.id],
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
    enabled: !!user,
  });

  // Fetch all registrations (for workshop host)
  const { data: registrations } = useQuery({
    queryKey: ["registrations", id, user?.id],
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

  // Mutation: Register for workshop (for participants)
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user || !paymentScreenshot) throw new Error("Missing required data");

      // Upload payment screenshot
      const fileExt = paymentScreenshot.name.split(".").pop();
      const filePath = `${id}/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("workshop-payments")
        .upload(filePath, paymentScreenshot);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("workshop-payments").getPublicUrl(filePath);

      // Create registration record with status "pending"
      const { error } = await supabase.from("workshop_registrations").insert({
        workshop_id: id,
        user_id: user.id,
        payment_screenshot_url: publicUrl,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id, user?.id] });
      toast.success("Registration submitted successfully");
      setPaymentScreenshot(null);
    },
    onError: (error) => {
      toast.error("Failed to register for workshop");
      console.error("Registration error:", error);
    },
  });

  // Mutation: Approve registration (for host)
  const updateStatusMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ status: "approved" })
        .eq("id", registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", id, user?.id] });
      toast.success("Registration approved successfully");
    },
    onError: (error) => {
      toast.error("Failed to approve registration");
      console.error("Update status error:", error);
    },
  });

  // Mutation: Reject registration (for host) – delete the record
  const rejectMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      // Actually delete the record instead of just updating status
      const { error } = await supabase
        .from("workshop_registrations")
        .delete()
        .eq("id", registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", id, user?.id] });
      toast.success("Registration rejected. Participant can re-register.");
    },
    onError: (error) => {
      toast.error("Failed to reject registration");
      console.error("Reject registration error:", error);
    },
  });

  // Mutation: Update meeting link (for host)
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
      toast.success("Meeting link updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update meeting link");
      console.error("Update meeting link error:", error);
    },
  });

  if (isLoadingWorkshop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!workshop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Workshop not found</h2>
          <p className="text-gray-500">The requested workshop does not exist.</p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/workshops")}
          size="sm"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Workshops
        </Button>
      </div>
    );
  }

  const isHost = user?.id === workshop.host_id;
  const isRegistered = !!registration;
  const regStatus = registration?.status || "";

  return (
    <motion.div 
      className="space-y-6 max-w-4xl mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => navigate("/workshops")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {workshop.title}
        </h1>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Hosted by {workshop.host?.username || "Unknown"}</span>
            </div>
            
            <p className="text-lg leading-relaxed">{workshop.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-muted/40 rounded-lg">
                <h3 className="font-medium mb-2">Workshop Details</h3>
                <div className="space-y-2">
                  <p>Date: {new Date(workshop.scheduled_at).toLocaleDateString()} at {new Date(workshop.scheduled_at).toLocaleTimeString()}</p>
                  <p>Duration: {workshop.duration} minutes</p>
                  {workshop.is_paid && <p>Price: ${workshop.price}</p>}
                  <p>Maximum Participants: {workshop.max_participants}</p>
                </div>
              </div>

              {/* Host: Always show the current meeting link (if it exists) */}
              {isHost && (
                <div className="p-4 bg-muted/40 rounded-lg">
                  <h3 className="font-medium mb-2">Host Options</h3>
                  {workshop.meeting_link ? (
                    <div className="mb-3">
                      <p className="font-medium">Meeting Link:</p>
                      <a
                        href={workshop.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate block"
                      >
                        {workshop.meeting_link}
                      </a>
                    </div>
                  ) : (
                    <p className="text-red-500 mb-3">No meeting link set.</p>
                  )}
                  <Button onClick={() => setIsUpdateDialogOpen(true)}>
                    Update Meeting Link
                  </Button>
                </div>
              )}
            </div>

            {/* Participant View (not host) */}
            {!isHost && (
              <div className="space-y-6">
                {/* If not registered, show Payment QR Code & file upload */}
                {!isRegistered && (
                  <div className="border p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-medium mb-4">Register for this Workshop</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <p className="font-medium mb-2">Payment QR Code:</p>
                        {workshop.payment_qr_code_url ? (
                          <img
                            src={workshop.payment_qr_code_url}
                            alt="Payment QR Code"
                            className="max-w-xs shadow-md rounded-md"
                          />
                        ) : (
                          <p className="text-muted-foreground">No payment QR code available</p>
                        )}
                      </div>
                      <div className="mt-6">
                        <p className="font-medium mb-2">Upload Payment Screenshot:</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setPaymentScreenshot(e.target.files?.[0] || null)
                          }
                          className="mb-4"
                        />
                        <Button
                          onClick={() => registerMutation.mutate()}
                          disabled={!paymentScreenshot || registerMutation.isPending}
                          className="w-full"
                        >
                          {registerMutation.isPending ? "Submitting..." : "Register for Workshop"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* If registered, show registration status (and meeting link if approved) */}
                {isRegistered && (
                  <div className="border p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-medium mb-4">Your Registration</h3>
                    {regStatus === "pending" && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="font-medium text-amber-700">
                          Your registration is pending review.
                        </p>
                        <p className="text-amber-600 mt-1 text-sm">
                          The workshop host will review your registration and approve it soon.
                        </p>
                      </div>
                    )}
                    {regStatus === "approved" && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-700 flex items-center">
                          <Check className="inline-block mr-2 h-5 w-5" />
                          Your registration is approved!
                        </p>
                        {workshop.meeting_link && (
                          <div className="mt-4">
                            <p className="font-medium">Meeting Link:</p>
                            <a
                              href={workshop.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {workshop.meeting_link}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {regStatus === "rejected" && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-700">
                          Your registration was rejected.
                        </p>
                        <p className="text-red-600 mt-1 text-sm">
                          Please try registering again with a valid payment proof.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Host's view of registration requests */}
            {isHost && registrations && registrations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Registration Requests
                </h2>
                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <Card
                      key={reg.id}
                      className={`overflow-hidden ${
                        reg.status === "approved"
                          ? "border-l-4 border-l-green-500"
                          : reg.status === "pending"
                          ? "border-l-4 border-l-amber-500"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="font-medium">User:</span>
                              <span className="ml-2">{reg.user.username}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                reg.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : reg.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {reg.status}
                              </span>
                            </div>
                          </div>
                          
                          {reg.payment_screenshot_url && (
                            <div className="mt-4 md:mt-0">
                              <p className="font-medium mb-1">Payment Screenshot:</p>
                              <img
                                src={reg.payment_screenshot_url}
                                alt="Payment Screenshot"
                                className="max-w-xs rounded shadow-sm"
                              />
                            </div>
                          )}
                          
                          {reg.status === "pending" && (
                            <div className="flex space-x-2 mt-4 md:mt-0">
                              <Button 
                                onClick={() => updateStatusMutation.mutate(reg.id)}
                                className="flex items-center"
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(reg.id)}
                                className="flex items-center"
                                disabled={rejectMutation.isPending}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {isHost && (!registrations || registrations.length === 0) && (
              <div className="mt-8 p-6 bg-muted/40 rounded-lg text-center">
                <h2 className="text-xl font-semibold mb-2">No Registration Requests</h2>
                <p className="text-muted-foreground">Your workshop doesn't have any registration requests yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Host: Update Meeting Link UI */}
      {isHost && (
        <Dialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Meeting Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter meeting link (Zoom, Google Meet, etc.)"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMeetingLinkMutation.mutate()}
                  disabled={!meetingLink || updateMeetingLinkMutation.isPending}
                >
                  {updateMeetingLinkMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
