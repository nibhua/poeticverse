import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadImage } from "@/utils/imageUpload";
import { WorkshopForm } from "@/components/workshops/WorkshopForm";
import { PageHeader } from "@/components/workshops/PageHeader";

export default function CreateWorkshop() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    date: string;
    duration: string;
    isPaid: boolean;
    price: string;
    maxParticipants: string;
    qrCodeFile: File | null;
    meetingLink: string;
  }) => {
    if (isLoading) {
      console.log("Already submitting, preventing double submission");
      return;
    }

    setIsLoading(true);
    console.log("Starting workshop creation process...");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Authentication error:", userError);
        toast.error("Please log in to create a workshop");
        navigate("/login");
        return;
      }

      console.log("Authenticated user:", user.id);

      let qrCodeUrl = null;
      if (formData.qrCodeFile && formData.isPaid) {
        console.log("Uploading QR code...");
        try {
          qrCodeUrl = await uploadImage(formData.qrCodeFile, "workshop-payments", `qr-codes/${Date.now()}`);
          if (!qrCodeUrl) {
            throw new Error("Failed to upload QR code");
          }
          console.log("QR code uploaded successfully:", qrCodeUrl);
        } catch (uploadError) {
          console.error("QR code upload error:", uploadError);
          toast.error("Failed to upload QR code. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      console.log("Creating workshop record...");
      const { error: workshopError } = await supabase.from("workshops").insert({
        host_id: user.id,
        title: formData.title,
        description: formData.description,
        scheduled_at: formData.date,
        duration: parseInt(formData.duration),
        is_paid: formData.isPaid,
        price: formData.isPaid ? parseFloat(formData.price) : null,
        max_participants: parseInt(formData.maxParticipants),
        payment_qr_code_url: qrCodeUrl,
        meeting_link: formData.meetingLink,
        status: 'scheduled',
      });

      if (workshopError) {
        console.error("Workshop creation error:", workshopError);
        throw workshopError;
      }

      console.log("Workshop created successfully");
      toast.success("Workshop created successfully");
      navigate("/workshops");
    } catch (error: any) {
      console.error("Create workshop error:", error);
      toast.error(error.message || "Failed to create workshop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <PageHeader title="Create Workshop" backPath="/workshops" />
      <WorkshopForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}