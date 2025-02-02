import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";
import { WorkshopForm } from "@/components/workshops/WorkshopForm";
import { PageHeader } from "@/components/workshops/PageHeader";

export default function CreateWorkshop() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        toast({
          title: "Error",
          description: "Please log in to create a workshop",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      console.log("Creating workshop for user:", user.id);

      let qrCodeUrl = null;
      if (formData.qrCodeFile && formData.isPaid) {
        console.log("Uploading QR code...");
        qrCodeUrl = await uploadImage(formData.qrCodeFile, "workshop-payments", `qr-codes/${Date.now()}`);
        if (!qrCodeUrl) {
          throw new Error("Failed to upload QR code");
        }
        console.log("QR code uploaded successfully:", qrCodeUrl);
      }

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
      
      toast({
        title: "Success",
        description: "Workshop created successfully",
      });
      navigate("/workshops");
    } catch (error: any) {
      console.error("Create workshop error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workshop. Please try again.",
        variant: "destructive",
      });
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